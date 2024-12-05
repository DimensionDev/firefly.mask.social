import { t } from '@lingui/macro';
import {
    useActivatedPluginSiteAdaptor,
    useCurrentVisitingIdentity,
    useLastRecognizedIdentity,
    useSiteThemeMode,
} from '@masknet/plugin-infra/content-script';
import { InjectedDialog, LoadingStatus, useCurrentLinkedPersona } from '@masknet/shared';
import { EMPTY_LIST, NetworkPluginID, PluginID } from '@masknet/shared-base';
import { useGasPrice } from '@masknet/web3-hooks-base';
import { ChainId, type GasConfig, GasEditor } from '@masknet/web3-shared-evm';
import { TabContext } from '@mui/lab';
import { DialogContent, Tab, useTheme } from '@mui/material';
import { signMessage } from '@wagmi/core';
import { Suspense, useCallback, useContext, useMemo, useState } from 'react';
import { type Hex, keccak256 } from 'viem';

import { config } from '@/configs/wagmiClient.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { Icons, MaskTabList, useTabs } from '@/mask/bindings/components.js';
import { makeStyles } from '@/mask/bindings/index.js';
import { ClaimRequirementsDialog } from '@/mask/plugins/red-packet/components/ClaimRequirementsDialog.js';
import { ClaimRequirementsRuleDialog } from '@/mask/plugins/red-packet/components/ClaimRequirementsRuleDialog.js';
import { FireflyRedpacketConfirmDialog } from '@/mask/plugins/red-packet/components/FireflyRedpacketConfirmDialog.js';
import { FireflyRedPacketHistoryDetails } from '@/mask/plugins/red-packet/components/FireflyRedPacketHistoryDetails.js';
import { FireflyRedPacketPast } from '@/mask/plugins/red-packet/components/FireflyRedPacketPast.js';
import { RedPacketERC20Form } from '@/mask/plugins/red-packet/components/RedPacketERC20Form.js';
import { CompositionTypeContext } from '@/mask/plugins/red-packet/components/RedPacketInjection.js';
import { RedPacketMetaKey } from '@/mask/plugins/red-packet/constants.js';
import { openComposition } from '@/mask/plugins/red-packet/helpers/openComposition.js';
import { reduceUselessPayloadInfo } from '@/mask/plugins/red-packet/helpers/reduceUselessPayloadInfo.js';
import type { RedPacketSettings } from '@/mask/plugins/red-packet/hooks/useCreateCallback.js';
import type { FireflyContext, FireflyRedpacketSettings } from '@/mask/plugins/red-packet/types.js';
import type { FireflyRedPacketAPI, RedPacketJSONPayload } from '@/providers/red-packet/types.js';

const useStyles = makeStyles<{ scrollY: boolean; isDim: boolean }>()((theme, { isDim, scrollY }) => {
    // it's hard to set dynamic color, since the background color of the button is blended transparent
    const darkBackgroundColor = isDim ? '#38414b' : '#292929';
    return {
        dialogContent: {
            padding: 0,
            scrollbarWidth: 'none',
            '::-webkit-scrollbar': {
                display: 'none',
            },

            overflowX: 'hidden',
            overflowY: scrollY ? 'auto' : 'hidden',
            position: 'relative',
        },
        abstractTabWrapper: {
            width: '100%',
            paddingBottom: theme.spacing(2),
        },
        arrowButton: {
            backgroundColor: theme.palette.mode === 'dark' ? darkBackgroundColor : undefined,
        },
        placeholder: {
            height: 474,
            boxSizing: 'border-box',
        },
        disabledTab: {
            background: 'transparent !important',
            color: `${theme.palette.maskColor.third} !important`,
        },
        dialogRoot: {
            zIndex: 45,
        },
    };
});

enum CreateRedPacketPageStep {
    NewRedPacketPage = 'new',
    ConfirmPage = 'confirm',
    ClaimRequirementsPage = 'claim_requirements',
}

interface RedPacketDialogProps {
    open: boolean;
    onClose: () => void;
    isOpenFromApplicationBoard?: boolean;
    source?: PluginID;
    fireflyContext: FireflyContext;
}

export default function RedPacketDialog(props: RedPacketDialogProps) {
    const [showHistory, setShowHistory] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [rpid, setRpid] = useState('');
    const [showClaimRule, setShowClaimRule] = useState(false);
    const [gasOption, setGasOption] = useState<GasConfig>();

    const [step, setStep] = useState(CreateRedPacketPageStep.NewRedPacketPage);

    const { account, chainId: contextChainId } = useChainContext();
    const definition = useActivatedPluginSiteAdaptor.visibility.useAnyMode(PluginID.RedPacket);
    const [currentHistoryTab, onChangeHistoryTab, historyTabs] = useTabs('claimed', 'sent');
    const theme = useTheme();
    const mode = useSiteThemeMode(theme);

    const { classes } = useStyles({ isDim: mode === 'dim', scrollY: !showHistory });

    const chainIdList: ChainId[] = useMemo(() => {
        return definition?.enableRequirement.web3?.[NetworkPluginID.PLUGIN_EVM]?.supportedChainIds ?? EMPTY_LIST;
    }, [definition?.enableRequirement.web3]);
    const chainId = chainIdList.includes(contextChainId) ? contextChainId : ChainId.Mainnet;

    // #region token lucky drop
    const [settings, setSettings] = useState<RedPacketSettings>();
    // #endregion

    // #region firefly redpacket
    const [fireflyRpSettings, setFireflyRpSettings] = useState<FireflyRedpacketSettings>();
    // #endregion

    // #region nft lucky drop
    const [openNFTConfirmDialog, setOpenNFTConfirmDialog] = useState(false);
    const [openSelectNFTDialog, setOpenSelectNFTDialog] = useState(false);
    // #endregion

    const handleClose = useCallback(() => {
        setStep(CreateRedPacketPageStep.NewRedPacketPage);
        setSettings(undefined);
        props.onClose();
    }, [props]);

    const currentIdentity = useCurrentVisitingIdentity();
    const lastRecognized = useLastRecognizedIdentity();
    const linkedPersona = useCurrentLinkedPersona();
    const senderName =
        lastRecognized?.identifier?.userId ?? currentIdentity?.identifier?.userId ?? linkedPersona?.nickname;

    const compositionType = useContext(CompositionTypeContext);
    const onCreateOrSelect = useCallback(
        async (
            payload: RedPacketJSONPayload,
            payloadImage?: string,
            claimRequirements?: FireflyRedPacketAPI.StrategyPayload[],
            publicKey?: string,
        ) => {
            if (payload.password === '') {
                if (payload.contract_version === 1) {
                    // eslint-disable-next-line no-alert
                    alert(
                        'Unable to share a lucky drop without a password. But you can still withdraw the lucky drop.',
                    );
                    // eslint-disable-next-line no-alert
                    payload.password = prompt('Please enter the password of the lucky drop:', '') ?? '';
                } else if (payload.contract_version > 1 && payload.contract_version < 4) {
                    // just sign out the password if it is lost.
                    payload.password = await signMessage(config, {
                        message: keccak256(payload.sender.message as Hex),
                        account: account as Hex,
                    });
                    payload.password = payload.password.slice(2);
                }
            }

            openComposition(RedPacketMetaKey, reduceUselessPayloadInfo(payload), compositionType, {
                payloadImage,
                claimRequirements,
                publicKey,
            });
            handleClose();
        },
        [compositionType, handleClose, account],
    );

    const onBack = useCallback(() => {
        if (step === CreateRedPacketPageStep.ConfirmPage) {
            setStep(CreateRedPacketPageStep.ClaimRequirementsPage);
        }
        if (step === CreateRedPacketPageStep.ClaimRequirementsPage) {
            setStep(CreateRedPacketPageStep.NewRedPacketPage);
        }
        if (step === CreateRedPacketPageStep.NewRedPacketPage) {
            handleClose();
        }
    }, [step, handleClose]);
    const isCreateStep = step === CreateRedPacketPageStep.NewRedPacketPage;
    const onNext = useCallback(() => {
        if (!isCreateStep) return;
        setStep(CreateRedPacketPageStep.ClaimRequirementsPage);
    }, [isCreateStep]);
    const onDialogClose = useCallback(() => {
        if (openSelectNFTDialog) return setOpenSelectNFTDialog(false);
        if (openNFTConfirmDialog) return setOpenNFTConfirmDialog(false);
        if (showDetails) return setShowDetails(false);
        if (showHistory) return setShowHistory(false);
        onBack();
    }, [showHistory, openNFTConfirmDialog, openSelectNFTDialog, onBack, showDetails]);

    const _onChange = useCallback((val: Omit<RedPacketSettings, 'password'>) => {
        setSettings(val);
    }, []);

    const handleCreated = useCallback(
        (
            payload: RedPacketJSONPayload,
            payloadImage?: string,
            claimRequirements?: FireflyRedPacketAPI.StrategyPayload[],
            publicKey?: string,
        ) => {
            onCreateOrSelect(payload, payloadImage, claimRequirements, publicKey);
            setSettings(undefined);
        },
        [onCreateOrSelect],
    );

    const title = useMemo(() => {
        if (showDetails) return t`More details`;
        if (showHistory) return t`History`;
        if (openSelectNFTDialog) return t`Choose your collection`;
        if (openNFTConfirmDialog) return t`Confirm`;
        if (step === CreateRedPacketPageStep.NewRedPacketPage) return t`Lucky Drop`;
        if (step === CreateRedPacketPageStep.ClaimRequirementsPage) return t`Claim Requirements`;
        return t`Confirm the Lucky Drop`;
    }, [showHistory, openSelectNFTDialog, openNFTConfirmDialog, step, showDetails]);

    const titleTail = useMemo(() => {
        if (
            step === CreateRedPacketPageStep.NewRedPacketPage &&
            !openNFTConfirmDialog &&
            !showHistory &&
            !showDetails
        ) {
            return (
                <Icons.History
                    style={{ cursor: account ? undefined : 'not-allowed' }}
                    disabled={!account}
                    onClick={() => {
                        if (!account) return;
                        setShowHistory((history) => !history);
                    }}
                />
            );
        }

        if (step === CreateRedPacketPageStep.ClaimRequirementsPage) {
            return <Icons.Questions onClick={() => setShowClaimRule(true)} />;
        }
        return null;
    }, [step, openNFTConfirmDialog, showHistory, showDetails, account]);

    // #region gas config
    const [defaultGasPrice] = useGasPrice(NetworkPluginID.PLUGIN_EVM, { chainId });
    const handleGasSettingChange = useCallback(
        (gasConfig: GasConfig) => {
            const editor = GasEditor.fromConfig(chainId, gasConfig);
            setGasOption((config) => {
                return editor.getGasConfig({
                    gasPrice: defaultGasPrice,
                    maxFeePerGas: defaultGasPrice,
                    maxPriorityFeePerGas: defaultGasPrice,
                    ...config,
                });
            });
        },
        [chainId, defaultGasPrice],
    );
    // #endregion

    const handleOpenDetails = useCallback(
        (redpacket_id: string) => {
            setRpid(redpacket_id);
            setShowDetails(true);
        },
        [setShowDetails, setRpid],
    );
    const handleClaimRequirementsNext = useCallback((settings: FireflyRedpacketSettings) => {
        setFireflyRpSettings(settings);
        setStep(CreateRedPacketPageStep.ConfirmPage);
    }, []);

    return (
        <TabContext value={showHistory ? currentHistoryTab : ''}>
            <InjectedDialog
                classes={{ root: classes.dialogRoot }}
                isOpenFromApplicationBoard={props.isOpenFromApplicationBoard}
                open={props.open}
                title={title}
                titleTail={titleTail}
                titleTabs={
                    step === CreateRedPacketPageStep.NewRedPacketPage && showHistory && !showDetails ? (
                        <MaskTabList variant="base" onChange={onChangeHistoryTab} aria-label="Redpacket">
                            <Tab label={t`Claimed`} value={historyTabs.claimed} />
                            <Tab label={t`Sent`} value={historyTabs.sent} />
                        </MaskTabList>
                    ) : null
                }
                onClose={onDialogClose}
                isOnBack={showHistory || step !== CreateRedPacketPageStep.NewRedPacketPage}
                disableTitleBorder
                titleBarIconStyle={
                    step !== CreateRedPacketPageStep.NewRedPacketPage || showHistory || showDetails ? 'back' : 'close'
                }
            >
                <DialogContent className={classes.dialogContent}>
                    {step === CreateRedPacketPageStep.NewRedPacketPage ? (
                        <>
                            <div
                                style={
                                    showHistory || showDetails
                                        ? { display: 'none', height: 0 }
                                        : { height: 'auto', paddingBottom: 100 }
                                }
                            >
                                <RedPacketERC20Form
                                    expectedChainId={chainId}
                                    origin={settings}
                                    gasOption={gasOption}
                                    onClose={handleClose}
                                    onNext={onNext}
                                    onChange={_onChange}
                                    onGasOptionChange={handleGasSettingChange}
                                />
                            </div>
                            {showHistory && !showDetails ? (
                                <FireflyRedPacketPast tabs={historyTabs} handleOpenDetails={handleOpenDetails} />
                            ) : null}

                            {showDetails ? (
                                <Suspense fallback={<LoadingStatus className={classes.placeholder} iconSize={30} />}>
                                    <FireflyRedPacketHistoryDetails rpid={rpid} />
                                </Suspense>
                            ) : null}
                        </>
                    ) : null}

                    {step === CreateRedPacketPageStep.ConfirmPage && settings ? (
                        <FireflyRedpacketConfirmDialog
                            onClose={handleClose}
                            onCreated={handleCreated}
                            fireflyContext={props.fireflyContext}
                            fireflySettings={fireflyRpSettings}
                            settings={settings}
                        />
                    ) : null}
                    {step === CreateRedPacketPageStep.ClaimRequirementsPage ? (
                        <>
                            <ClaimRequirementsDialog
                                origin={fireflyRpSettings?.requirements}
                                onNext={handleClaimRequirementsNext}
                            />
                            <ClaimRequirementsRuleDialog open={showClaimRule} onClose={() => setShowClaimRule(false)} />
                        </>
                    ) : null}
                </DialogContent>
            </InjectedDialog>
        </TabContext>
    );
}
