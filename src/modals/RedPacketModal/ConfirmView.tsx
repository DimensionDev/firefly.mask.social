import { t, Trans } from '@lingui/macro';
import { formatCurrency, multipliedBy, rightShift } from '@masknet/web3-shared-base';
import { isValidAddress } from '@masknet/web3-shared-evm';
import { BigNumber } from 'bignumber.js';
import { compact, flatten } from 'lodash-es';
import { useCallback, useContext, useMemo, useRef } from 'react';
import { useAsync, useAsyncFn } from 'react-use';
import { useEnsName } from 'wagmi';

import ArrowLeftIcon from '@/assets/arrow-circle-left.svg';
import ArrowRightIcon from '@/assets/arrow-circle-right.svg';
import ArrowDownIcon from '@/assets/arrow-down.svg';
import InfoIcon from '@/assets/info.svg';
import LoadingIcon from '@/assets/loading.svg';
import QuestionIcon from '@/assets/question.svg';
import { ActionButton } from '@/components/ActionButton.js';
import { RedPacketEnvelope } from '@/components/RedPacket/RedPacketEnvelope.js';
import { Tab, Tabs } from '@/components/Tabs/index.js';
import { Tooltip } from '@/components/Tooltip.js';
import { ALLOWED_COVER_MIMES, EMPTY_LIST } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { useCreateFTRedPacketCallback } from '@/hooks/useCreateFTRedPacketCallback.js';
import { useFungibleTokenPrice } from '@/hooks/useFungibleTokenPrice.js';
import { useProfileStoreAll } from '@/hooks/useProfileStore.js';
import { useSelectFiles } from '@/hooks/useSelectFiles.js';
import { DEFAULT_THEME_ID } from '@/mask/plugins/red-packet/constants.js';
import { ImageEditorRef } from '@/modals/controls.js';
import {
    RedPacketContext,
    redPacketCoverTabs,
    redPacketFontColorTabs,
} from '@/modals/RedPacketModal/RedPacketContext.js';
import { REQUIREMENT_ICON_MAP } from '@/modals/RedPacketModal/RequirementsView.js';
import { ShareAccountsPopover } from '@/modals/RedPacketModal/ShareAccountsPopover.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';
import { FireflyRedPacketAPI,RequirementType  } from '@/providers/red-packet/types.js';
import { uploadToS3 } from '@/services/uploadToS3.js';

interface ThemeVariant {
    neutral: FireflyRedPacketAPI.ThemeGroupSettings;
    golden: FireflyRedPacketAPI.ThemeGroupSettings;
}

export function ConfirmView() {
    const REQUIREMENT_TITLE_MAP: Record<RequirementType, React.ReactNode> = {
        [RequirementType.Follow]: t`Follow me`,
        [RequirementType.Like]: t`Like`,
        [RequirementType.Repost]: t`Repost`,
        [RequirementType.Comment]: t`Comment`,
        [RequirementType.NFTHolder]: t`NFT holder`,
    };
    const {
        message,
        coverType,
        setCoverType,
        fontColor,
        setFontColor,
        shareFrom,
        setShareFrom,
        accounts,
        randomType,
        shares,
        token,
        rawAmount,
        rules,
        requireCollection,
        customThemes,
        setCustomThemes,
        themes,
        theme,
        setTheme,
    } = useContext(RedPacketContext);
    const { chainId, account } = useChainContext();
    const themeId = theme?.tid || DEFAULT_THEME_ID;
    const isCustomTheme = customThemes.some((t) => t.cover.bg_image === theme.cover.bg_image);
    const themeIndex = themes.indexOf(theme);

    const {
        Lens: { currentProfile: currentLensProfile },
        Farcaster: { currentProfile: currentFarcasterProfile },
        Twitter: { currentProfile: currentTwitterProfile },
    } = useProfileStoreAll();
    const { data: tokenPrice = 0 } = useFungibleTokenPrice(token?.address, { chainId });

    const { data: shareFromEnsName } = useEnsName({
        address: shareFrom as `0x${string}`,
        query: {
            enabled: isValidAddress(shareFrom),
        },
    });

    const isRandom = randomType === 'random';
    const totalAmount = useMemo(
        () => (isRandom || !rawAmount ? rawAmount : multipliedBy(rawAmount, shares).toFixed()),
        [rawAmount, isRandom, shares],
    );
    const priceUSD = useMemo(() => {
        if (!tokenPrice || !totalAmount) return;
        return formatCurrency(new BigNumber(totalAmount).times(tokenPrice), 'USD', {
            onlyRemainTwoOrZeroDecimal: true,
        });
    }, [totalAmount, tokenPrice]);

    const { value, loading } = useAsync(async () => {
        const postReactions = rules.filter((x) => x !== RequirementType.Follow && x !== RequirementType.NFTHolder);

        const payload = rules
            ? compact([
                  rules.includes(RequirementType.Follow)
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
                  rules.includes(RequirementType.NFTHolder) && requireCollection?.address
                      ? {
                            type: FireflyRedPacketAPI.StrategyType.nftOwned,
                            payload: [
                                {
                                    chainId: requireCollection.chainId ?? chainId,
                                    contractAddress: requireCollection.address,
                                    collectionName: requireCollection.name,
                                },
                            ],
                        }
                      : undefined,
              ])
            : EMPTY_LIST;

        return {
            publicKey: await FireflyRedPacket.createPublicKey(themeId, account, payload),
            claimRequirements: payload,
        };
    }, [
        rules,
        currentLensProfile,
        currentFarcasterProfile,
        currentTwitterProfile,
        requireCollection?.address,
        requireCollection?.chainId,
        requireCollection?.name,
        chainId,
        themeId,
        account,
    ]);

    const shareFromName = isValidAddress(shareFrom)
        ? (shareFromEnsName ?? formatAddress(shareFrom, 4))
        : `${shareFrom}`;

    const [{ loading: creatingRedPacket }, handleCreate] = useCreateFTRedPacketCallback(
        shareFromName,
        value?.publicKey ?? '',
        value?.claimRequirements,
    );

    const selectFiles = useSelectFiles();
    // We create two variants for each custom theme, one in default color and
    // one in golden color, since we can't change the color after creation of the
    // theme
    const themeVariantsMapRef = useRef(new Map<string, ThemeVariant>());

    const [{ loading: creatingTheme }, createTheme] = useAsyncFn(
        async (file: File) => {
            const blob = await ImageEditorRef.openAndWaitForClose({
                image: file,
                AvatarEditorProps: {
                    border: [0, 30],
                    borderRadius: 0,
                    height: 336,
                    width: 480,
                    style: {
                        borderRadius: 8,
                    },
                },
            });
            if (!blob) return false;
            const url = await uploadToS3(blob, 'red-packet-cover');
            // Create two variants for each custom theme
            const [themeId, goldenThemeId] = await Promise.all([
                FireflyRedPacket.createTheme({ font_color: '#ffffff', image: url }),
                FireflyRedPacket.createTheme({ font_color: '#FFE4A6', image: url }),
            ]);
            const [theme, goldenTheme] = await Promise.all([
                FireflyRedPacket.getTheme({ themeId }),
                FireflyRedPacket.getTheme({ themeId: goldenThemeId }),
            ]);
            if (goldenTheme) {
                themeVariantsMapRef.current.set(url, {
                    neutral: theme,
                    golden: goldenTheme,
                });
                setTheme(goldenTheme);
                setFontColor('golden');
                setCustomThemes((customThemes) => [...customThemes, goldenTheme]);
            } else {
                enqueueErrorMessage(t`Failed to create custom theme.`);
                return false;
            }
            return true;
        },
        [setCustomThemes, setFontColor],
    );

    const handleTabChange = useCallback(
        async (tab: 'default' | 'custom') => {
            if (tab === 'custom') {
                const files = await selectFiles(ALLOWED_COVER_MIMES.join(', '));
                if (files.length === 0) return;
                const created = await createTheme(files[0]);
                if (!created) return;
            } else {
                setTheme(themes[0]);
            }
            setCoverType(tab);
        },
        [createTheme, setTheme, selectFiles, setCoverType, themes],
    );

    return (
        <>
            <div className="flex flex-1 flex-col gap-y-4 bg-primaryBottom px-4 pt-2">
                <div className="flex gap-x-4">
                    <div className="flex flex-1 flex-col gap-y-2">
                        <label className="self-start text-sm font-bold leading-[18px]">
                            <Trans>Cover background</Trans>
                        </label>

                        <Tabs value={coverType} onChange={handleTabChange} variant="solid" className="self-start">
                            {redPacketCoverTabs.map((tab) => (
                                <Tab value={tab.value} key={tab.value}>
                                    {tab.label}
                                </Tab>
                            ))}
                        </Tabs>

                        <label className="self-start text-sm font-bold leading-[18px]">
                            <Trans>Font Color</Trans>
                        </label>
                        <Tabs
                            value={fontColor}
                            onChange={(variant) => {
                                const variants = themeVariantsMapRef.current.get(theme.cover.bg_image);
                                if (variants) {
                                    setTheme(variant === 'golden' ? variants.golden : variants.neutral);
                                }
                                setFontColor(variant);
                            }}
                            variant="solid"
                            className="self-start"
                        >
                            {redPacketFontColorTabs.map((tab) => (
                                <Tab
                                    value={tab.value}
                                    key={tab.value}
                                    disabled={tab.value === 'neutral' && coverType === 'default'}
                                >
                                    {tab.label}
                                </Tab>
                            ))}
                        </Tabs>
                        <label className="flex items-center self-start text-sm font-bold leading-[18px]">
                            <Trans>Share From</Trans>
                            <Tooltip
                                placement="top"
                                content={
                                    <Trans>
                                        Customize Lucky Drop sender. Select either Lens or Farcaster handle, or use the
                                        currently connected wallet.
                                    </Trans>
                                }
                            >
                                <QuestionIcon width={18} height={18} className="ml-2 text-secondary" />
                            </Tooltip>
                        </label>

                        <ShareAccountsPopover
                            selected={shareFrom}
                            className="w-full"
                            accounts={accounts}
                            onClick={(name) => setShareFrom(name)}
                        >
                            <div className="flex cursor-pointer items-center justify-between rounded-lg bg-bg p-3">
                                <span className="text-sm font-bold">
                                    {isValidAddress(shareFrom)
                                        ? (shareFromEnsName ?? formatAddress(shareFrom, 4))
                                        : `@${shareFrom}`}
                                </span>
                                <ArrowDownIcon width={24} height={24} className="text-secondary" />
                            </div>
                        </ShareAccountsPopover>
                    </div>
                    <div className="flex w-[220px] flex-col gap-2">
                        <h2 className="text-sm font-bold text-secondary">
                            <Trans>Preview</Trans>
                        </h2>
                        {creatingTheme ? (
                            <div className="flex h-[154px] w-[220px] items-center justify-center">
                                <LoadingIcon className="animate-spin" width={24} height={24} />
                            </div>
                        ) : theme ? (
                            <div className="flex flex-col gap-2">
                                <div className="h-[154px] w-[220px] overflow-hidden rounded-[18px]">
                                    <RedPacketEnvelope
                                        themeId={theme.tid}
                                        token={token}
                                        shares={shares}
                                        total={rightShift(totalAmount, token.decimals ?? 0).toFixed(0)}
                                        sender={shareFrom}
                                        message={message}
                                        usage="payload"
                                    />
                                </div>
                                {isCustomTheme ? (
                                    <div
                                        className="flex cursor-pointer justify-center gap-3 text-sm text-highlight"
                                        onClick={async () => {
                                            const files = await selectFiles(ALLOWED_COVER_MIMES.join(', '));
                                            if (files.length === 0) return;
                                            await createTheme(files[0]);
                                        }}
                                    >
                                        <Trans>Upload to change</Trans>
                                    </div>
                                ) : (
                                    <div className="flex justify-center gap-3">
                                        <ArrowLeftIcon
                                            className={classNames('h-6 w-6', {
                                                'cursor-not-allowed text-third': themeIndex === 0,
                                                'cursor-pointer text-second': themeIndex !== 0,
                                            })}
                                            onClick={() => {
                                                if (themeIndex === 0) return;
                                                setTheme(themes[themeIndex - 1]);
                                            }}
                                        />
                                        <ArrowRightIcon
                                            className={classNames('h-6 w-6', {
                                                'cursor-not-allowed text-third': themeIndex === themes.length - 1,
                                                'cursor-pointer text-second': themeIndex !== themes.length - 1,
                                            })}
                                            onClick={() => {
                                                if (themeIndex >= themes.length - 1) return;
                                                setTheme(themes[themeIndex + 1]);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className="flex justify-between text-sm font-bold leading-[18px]">
                    <label>
                        <Trans>Drop type</Trans>
                    </label>
                    <span className="text-secondary">
                        {randomType === 'random' ? <Trans>Random Split</Trans> : <Trans>Equal Split</Trans>}
                    </span>
                </div>
                <div className="flex justify-between text-sm font-bold leading-[18px]">
                    <label>
                        <Trans>Number of winners</Trans>
                    </label>
                    <span className="text-secondary">{shares}</span>
                </div>
                <div className="flex justify-between text-sm font-bold leading-[18px]">
                    <label>
                        <Trans>Total amount</Trans>
                    </label>
                    <span className="text-secondary">
                        {totalAmount} {token?.symbol} {priceUSD ? `(${priceUSD})` : ''}
                    </span>
                </div>

                {rules.length ? (
                    <div className="flex justify-between text-sm font-bold leading-[18px]">
                        <label>
                            <Trans>Claim requirements</Trans>
                        </label>
                        <div className="flex gap-2 text-secondary">
                            {rules.map((rule) => {
                                const Icon = REQUIREMENT_ICON_MAP[rule];
                                const title = REQUIREMENT_TITLE_MAP[rule];

                                return (
                                    <Tooltip content={title} placement="top" key={rule}>
                                        <Icon width={16} height={16} />
                                    </Tooltip>
                                );
                            })}
                        </div>
                    </div>
                ) : null}

                <div className="flex max-w-[568px] gap-x-[6px] rounded-[4px] bg-bg p-3">
                    <InfoIcon width={20} height={20} />
                    <div className="flex flex-col gap-[10px] text-start text-[13px] leading-[18px]">
                        <div>
                            <Trans>You can withdraw any unclaimed amount 24 hours after sending this lucky drop.</Trans>
                        </div>
                        <div className="text-danger">
                            By clicking &quot;Next&quot;, you acknowledge the risk associated with decentralized
                            networks and beta products.
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-grow" />

            <div className="w-full bg-lightBottom80 p-4 shadow-primary backdrop-blur-lg dark:shadow-primaryDark">
                <ActionButton
                    className="rounded-lg"
                    onClick={handleCreate}
                    loading={creatingRedPacket || creatingTheme || loading}
                >
                    <Trans>Next</Trans>
                </ActionButton>
            </div>
        </>
    );
}
