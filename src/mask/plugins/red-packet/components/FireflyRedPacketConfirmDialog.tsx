'use client';
import { t, Trans } from '@lingui/macro';
import { Alert, FormattedBalance, FormattedCurrency, TokenIcon } from '@masknet/shared';
import { NetworkPluginID } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { useFungibleTokenPrice, useReverseAddress } from '@masknet/web3-hooks-base';
import { formatBalance, formatCurrency, leftShift } from '@masknet/web3-shared-base';
import { formatEthereumAddress, type GasConfig, isValidAddress, isValidDomain } from '@masknet/web3-shared-evm';
import { Box, Popover, Radio, Skeleton, Typography } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { compact, flatten, uniqBy } from 'lodash-es';
import { useMemo, useState } from 'react';
import { useAsync, useStateList } from 'react-use';
import type { Hex } from 'viem';
import { useEnsName } from 'wagmi';

import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { ActionButton, Icons, ShadowRootTooltip } from '@/mask/bindings/components.js';
import { makeStyles } from '@/mask/bindings/index.js';
import {
    REQUIREMENT_ICON_MAP,
    REQUIREMENT_TITLE_MAP,
} from '@/mask/plugins/red-packet/components/ClaimRequirementsDialog.js';
import { type RedPacketSettings } from '@/mask/plugins/red-packet/hooks/useCreateCallback.js';
import { useCreateFTRedPacketCallback } from '@/mask/plugins/red-packet/hooks/useCreateFTRedPacketCallback.js';
import {
    type FireflyContext,
    type FireflyRedPacketSettings,
    RequirementType,
} from '@/mask/plugins/red-packet/types.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';
import { FireflyRedPacketAPI, type RedPacketJSONPayload } from '@/providers/red-packet/types.js';

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(2),
    },
    info: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(2),
    },
    item: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
    },
    tips: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 400,
    },
    price: {
        color: theme.palette.maskColor.third,
    },
    requirements: {
        display: 'flex',
        alignItems: 'center',
        columnGap: 8,
    },
    question: {
        color: theme.palette.maskColor.second,
    },
    arrow: {
        color: theme.palette.maskColor.second,
        cursor: 'pointer',
    },
    control: {
        display: 'flex',
        justifyContent: 'center',
        columnGap: theme.spacing(1.5),
    },
    alert: {
        gap: 6,
    },
    footer: {
        width: '100%',
        padding: theme.spacing(2),
        boxSizing: 'border-box',
        position: 'sticky',
        bottom: 0,
        background: theme.palette.maskColor.bottom,
        boxShadow: theme.palette.maskColor.bottomBg,
    },
    accountList: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(1),
        padding: theme.spacing(1, 0),
        borderRadius: 8,
        boxShadow: '0px 0px 16px 0px rgba(101, 119, 134, 0.20)',
        minWidth: 288,
    },
    accountListItem: {
        padding: theme.spacing(0.5, 1.5),
        display: 'flex',
        columnGap: theme.spacing(1),
        cursor: 'pointer',
        alignItems: 'center',
    },
    accountName: {
        fontSize: 16,
        lineHeight: '20px',
        fontWeight: 700,
    },
}));

export interface FireflyRedPacketConfirmDialogProps {
    settings: RedPacketSettings;
    fireflySettings?: FireflyRedPacketSettings;
    fireflyContext: FireflyContext;
    gasOption?: GasConfig;
    onCreated: (
        payload: RedPacketJSONPayload,
        payloadImage?: string,
        claimRequirements?: FireflyRedPacketAPI.StrategyPayload[],
        publicKey?: string,
    ) => void;
    onClose: () => void;
}

function formatAccountName(account?: string) {
    if (!account) return account;
    if (isValidAddress(account)) return formatEthereumAddress(account, 4);
    if (isValidDomain(account)) return account;
    return `@${account}`;
}

export function FireflyRedPacketConfirmDialog({
    settings,
    fireflySettings,
    fireflyContext,
    gasOption,
    onCreated,
    onClose,
}: FireflyRedPacketConfirmDialogProps) {
    const { currentFarcasterProfile, currentLensProfile, currentTwitterProfile } = fireflyContext || {};
    const { chainId, account } = useChainContext();
    const { data: ensName } = useEnsName({ address: account as Hex });
    const { data: lensOwnerENS } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, currentLensProfile?.ownedBy, true);
    const { data: farcasterOwnerENS } = useReverseAddress(
        NetworkPluginID.PLUGIN_EVM,
        currentFarcasterProfile?.ownedBy,
        true,
    );
    const { classes, theme } = useStyles();
    const snsHandle = currentLensProfile?.handle || currentFarcasterProfile?.handle || currentTwitterProfile?.handle;
    const [currentAccount, setCurrentAccount] = useState(snsHandle || ensName || account);

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const { data: price } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, settings?.token?.address);

    const amount = useMemo(
        () => leftShift(settings?.total || 0, settings?.token?.decimals),
        [settings.total, settings.token?.decimals],
    );

    const { value: urls, loading: fetchUrlsLoading } = useAsync(async () => {
        if (!currentAccount) return EMPTY_LIST;
        return FireflyRedPacket.getPayloadUrls(
            isValidAddress(currentAccount) || isValidDomain(currentAccount) ? currentAccount : `@${currentAccount}`,
            settings.total,
            'fungible',
            settings.token?.symbol,
            settings.token?.decimals,
        );
    }, [currentAccount, settings.total, settings.token]);

    const { state, currentIndex, prev, next } = useStateList<
        | {
              themeId: string;
              url: string;
          }
        | undefined
    >(urls);

    const isFirst = currentIndex === 0;
    const isLatest = urls?.length && currentIndex === urls.length - 1;

    const accounts = useMemo(() => {
        const { currentFarcasterProfile, currentLensProfile, currentTwitterProfile } = fireflyContext;
        return uniqBy(
            compact([
                currentLensProfile
                    ? { icon: <Icons.Lens size={24} />, displayName: currentLensProfile.handle }
                    : undefined,
                currentFarcasterProfile
                    ? { icon: <Icons.Farcaster size={24} />, displayName: currentFarcasterProfile.handle }
                    : undefined,
                currentLensProfile?.ownedBy
                    ? { icon: <Icons.MaskWallet size={24} />, displayName: lensOwnerENS || currentLensProfile.address }
                    : undefined,
                currentTwitterProfile
                    ? { icon: <Icons.TwitterXRound size={24} />, displayName: currentTwitterProfile.handle }
                    : undefined,
                currentFarcasterProfile?.ownedBy
                    ? {
                          icon: <Icons.MaskWallet size={24} />,
                          displayName: farcasterOwnerENS || currentFarcasterProfile.ownedBy,
                      }
                    : undefined,
                account ? { icon: <Icons.MaskWallet size={24} />, displayName: ensName || account } : undefined,
            ]),
            (x) => x.displayName?.toLowerCase(),
        );
    }, [account, fireflyContext, farcasterOwnerENS, lensOwnerENS, ensName]);

    const { loading: imageLoading } = useAsync(async () => {
        if (!state?.url) return;
        await fetch(state.url);
    }, [state?.url]);

    const { value, loading } = useAsync(async () => {
        if (!state?.themeId) return;
        const postReactions = fireflySettings?.requirements.filter(
            (x) => x !== RequirementType.Follow && x !== RequirementType.NFTHolder,
        );
        const payload = fireflySettings
            ? compact([
                  fireflySettings.requirements.includes(RequirementType.Follow)
                      ? {
                            type: FireflyRedPacketAPI.StrategyType.profileFollow,
                            payload: compact([
                                currentLensProfile
                                    ? {
                                          platform: FireflyRedPacketAPI.PlatformType.lens,
                                          profileId: currentLensProfile.profileId,
                                      }
                                    : undefined,
                                currentFarcasterProfile
                                    ? {
                                          platform: FireflyRedPacketAPI.PlatformType.farcaster,
                                          profileId: currentFarcasterProfile.profileId,
                                      }
                                    : undefined,
                                currentTwitterProfile
                                    ? {
                                          platform: FireflyRedPacketAPI.PlatformType.twitter,
                                          profileId: currentTwitterProfile.profileId,
                                      }
                                    : undefined,
                            ]),
                        }
                      : undefined,
                  postReactions?.length
                      ? {
                            type: FireflyRedPacketAPI.StrategyType.postReaction,
                            payload: {
                                reactions: flatten(
                                    postReactions.map((x) => {
                                        if (x === RequirementType.Repost) return ['repost', 'quote'];
                                        return x.toLowerCase();
                                    }),
                                ),
                            },
                        }
                      : undefined,
                  fireflySettings.requirements.includes(RequirementType.NFTHolder) && fireflySettings.nftHolderContract
                      ? {
                            type: FireflyRedPacketAPI.StrategyType.nftOwned,
                            payload: [
                                {
                                    chainId: fireflySettings.nftChainId ?? chainId,
                                    contractAddress: fireflySettings.nftHolderContract,
                                    collectionName: fireflySettings.nftCollectionName,
                                },
                            ],
                        }
                      : undefined,
              ])
            : EMPTY_LIST;

        return {
            publicKey: await FireflyRedPacket.createPublicKey(state.themeId, currentAccount, payload),
            claimRequirements: payload,
        };
    }, [
        state?.themeId,
        currentLensProfile,
        currentFarcasterProfile,
        currentTwitterProfile,
        fireflySettings,
        chainId,
        currentAccount,
    ]);

    const { createRedPacket, isCreating } = useCreateFTRedPacketCallback(
        value?.publicKey ?? '',
        '',
        settings,
        gasOption,
        (payload: RedPacketJSONPayload) => onCreated(payload, state?.url, value?.claimRequirements, value?.publicKey),
        onClose,
        currentAccount,
    );

    if (!settings) return null;

    const popover = (
        <Popover
            open={!!anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorEl={anchorEl}
            disableScrollLock
            disableRestoreFocus
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            classes={{ paper: classes.accountList }}
        >
            {accounts.map(({ displayName, icon }, index) => {
                const isChecked = currentAccount && displayName?.toLowerCase() === currentAccount.toLowerCase();

                return (
                    <Box
                        key={index}
                        className={classes.accountListItem}
                        onClick={() => {
                            if (!displayName) return;
                            setCurrentAccount(displayName);
                            setAnchorEl(null);
                        }}
                    >
                        <Box display="flex" columnGap={1} flex={1} alignItems="center">
                            {icon}
                            <Typography className={classes.accountName}>{formatAccountName(displayName)}</Typography>
                        </Box>
                        {isChecked ? <Radio checked sx={{ p: 0 }} /> : null}
                    </Box>
                );
            })}
        </Popover>
    );

    return (
        <>
            <Box className={classes.container}>
                <Box className={classes.info}>
                    <Box className={classes.item}>
                        <Typography className={classes.title}>{t`Drop Type`}</Typography>
                        <Typography className={classes.title}>
                            {settings.isRandom ? t`Random Amount` : t`Equal Amount`}
                        </Typography>
                    </Box>
                    <Box className={classes.item}>
                        <Typography className={classes.title}>{t`Number of Winners`}</Typography>
                        <Typography className={classes.title}>{settings.shares}</Typography>
                    </Box>
                    <Box className={classes.item}>
                        <Typography className={classes.title}>{t`Amount`}</Typography>
                        <Typography
                            className={classes.title}
                            display="flex"
                            alignItems="center"
                            columnGap={0.5}
                            component="div"
                        >
                            <FormattedBalance
                                value={settings.total}
                                decimals={settings.token?.decimals}
                                significant={4}
                                formatter={formatBalance}
                            />
                            {settings.token ? (
                                <TokenIcon
                                    address={settings.token.address}
                                    name={settings.token?.name}
                                    logoURL={settings.token?.logoURL}
                                    size={20}
                                />
                            ) : null}
                            <Typography component="span" className={classes.price}>
                                (
                                <FormattedCurrency
                                    value={new BigNumber(price || 0).times(amount)}
                                    formatter={formatCurrency}
                                    options={{ onlyRemainTwoOrZeroDecimal: true }}
                                />
                                )
                            </Typography>
                        </Typography>
                    </Box>
                    <Box className={classes.item}>
                        <Typography className={classes.title}>
                            <Trans>Claim Requirements</Trans>
                        </Typography>
                        {fireflySettings?.requirements.length ? (
                            <Box className={classes.requirements}>
                                {fireflySettings?.requirements.map((x) => {
                                    const Icon = REQUIREMENT_ICON_MAP[x];
                                    const title = REQUIREMENT_TITLE_MAP[x];
                                    return (
                                        <ShadowRootTooltip key={x} title={title} placement="top" arrow>
                                            <Icon size={16} />
                                        </ShadowRootTooltip>
                                    );
                                })}
                            </Box>
                        ) : (
                            <Typography className={classes.title}>
                                <Trans>No</Trans>
                            </Typography>
                        )}
                    </Box>
                    <Box className={classes.item}>
                        <Typography className={classes.title} display="flex" columnGap={0.5}>
                            <Trans>Share From</Trans>
                            <ShadowRootTooltip
                                title={t`Customize Lucky Drop sender. Select either Lens or Forecaster usernames, or use the currently connected wallet.`}
                            >
                                <Icons.Questions size={18} className={classes.question} />
                            </ShadowRootTooltip>
                        </Typography>
                        <Typography className={classes.title} display="flex" columnGap={0.5} alignItems="center">
                            {formatAccountName(currentAccount)}
                            <Icons.ArrowDrop
                                className={classes.arrow}
                                size={18}
                                onMouseDown={(event) => setAnchorEl(event.currentTarget)}
                            />
                        </Typography>
                    </Box>
                    <Typography className={classes.title} sx={{ textAlign: 'center', width: '100%' }}>
                        <Trans>Image Preview</Trans>
                    </Typography>

                    {state ? (
                        <Box py={2} display="flex" justifyContent="center">
                            <div
                                className={classNames(
                                    'relative h-[202px] w-[288px] overflow-hidden rounded-2xl',
                                    imageLoading || fetchUrlsLoading ? 'hidden' : '',
                                )}
                            >
                                <Image alt={state.themeId} key={state.themeId} fill unoptimized src={state.url} />
                            </div>
                            {imageLoading || fetchUrlsLoading ? (
                                <Skeleton style={{ width: 288, height: 202 }} variant="rounded" />
                            ) : null}
                        </Box>
                    ) : null}
                    <Box className={classes.control}>
                        <Icons.ArrowCircle
                            onClick={prev}
                            sx={{
                                color: isFirst ? theme.palette.maskColor.third : theme.palette.maskColor.second,
                                cursor: isFirst ? 'not-allowed' : 'pointer',
                            }}
                        />
                        <Icons.ArrowCircle
                            onClick={next}
                            sx={{
                                transform: 'rotate(180deg)',
                                color: isLatest ? theme.palette.maskColor.third : theme.palette.maskColor.second,
                                cursor: isLatest ? 'not-allowed' : 'pointer',
                            }}
                        />
                    </Box>
                    <Alert open className={classes.alert}>
                        <Typography className={classes.tips}>
                            <Trans>You can withdraw any unclaimed amount 24 hours after sending this lucky drop.</Trans>
                        </Typography>
                        <Typography className={classes.tips} sx={{ color: theme.palette.maskColor.danger, mt: 1.2 }}>
                            <Trans>
                                By clicking &quot;Next&quot;, you acknowledge the risk associated with decentralized
                                networks and beta products.
                            </Trans>
                        </Typography>
                    </Alert>
                </Box>
            </Box>
            <Box className={classes.footer}>
                <ActionButton loading={isCreating || loading || fetchUrlsLoading} onClick={createRedPacket} fullWidth>
                    <Trans>Next</Trans>
                </ActionButton>
            </Box>
            {popover}
        </>
    );
}
