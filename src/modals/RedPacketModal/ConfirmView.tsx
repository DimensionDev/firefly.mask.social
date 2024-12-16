import { Trans } from '@lingui/macro';
import { formatCurrency, rightShift } from '@masknet/web3-shared-base';
import { isValidAddress } from '@masknet/web3-shared-evm';
import { BigNumber } from 'bignumber.js';
import { compact, first, flatten } from 'lodash-es';
import { useContext, useMemo } from 'react';
import { useAsync, useStateList } from 'react-use';
import { useEnsName } from 'wagmi';

import ArrowCircle from '@/assets/arrow-circle.svg';
import ArrowDownIcon from '@/assets/arrow-down.svg';
import InfoIcon from '@/assets/info.svg';
import QuestionIcon from '@/assets/question.svg';
import { ActionButton } from '@/components/ActionButton.js';
import { Image } from '@/components/Image.js';
import { Loading } from '@/components/Loading.js';
import { Tab, Tabs } from '@/components/Tabs/index.js';
import { Tooltip } from '@/components/Tooltip.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { useCreateFTRedPacketCallback } from '@/hooks/useCreateFTRedPacketCallback.js';
import { useFungibleTokenPrice } from '@/hooks/useFungibleTokenPrice.js';
import { useProfileStoreAll } from '@/hooks/useProfileStore.js';
import { RequirementType } from '@/mask/plugins/red-packet/types.js';
import {
    RedPacketContext,
    redPacketCoverTabs,
    redPacketDisplayTabs,
} from '@/modals/RedPacketModal/RedPacketContext.js';
import { REQUIREMENT_ICON_MAP, REQUIREMENT_TITLE_MAP } from '@/modals/RedPacketModal/RequirementsView.js';
import { ShareAccountsPopover } from '@/modals/RedPacketModal/ShareAccountsPopover.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';
import { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';
import { useUpdateEffect } from 'usehooks-ts';

export function ConfirmView() {
    const {
        coverType,
        setCoverType,
        displayType,
        setDisplayType,
        shareFrom,
        setShareFrom,
        accounts,
        randomType,
        shares,
        token,
        totalAmount,
        rules,
        requireCollection,
        message,
    } = useContext(RedPacketContext);
    const { chainId, account } = useChainContext();

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

    const priceUSD = useMemo(() => {
        if (!tokenPrice || !totalAmount) return;
        return formatCurrency(new BigNumber(totalAmount).times(tokenPrice), 'USD', {
            onlyRemainTwoOrZeroDecimal: true,
        });
    }, [totalAmount, tokenPrice]);

    const { value: urls, loading: fetchUrlsLoading } = useAsync(async () => {
        if (!account) return EMPTY_LIST;
        return FireflyRedPacket.getPayloadUrls(
            shareFrom,
            rightShift(totalAmount, token?.decimals).toString(),
            'fungible',
            token?.symbol,
            token?.decimals,
            message,
        );
    }, [account, shares, token, message]);

    const { state, prev, next, isLast, isFirst, currentIndex, setState } = useStateList<
        | {
              themeId: string;
              url: string;
          }
        | undefined
    >(urls);

    useUpdateEffect(() => {
        if (!state && urls?.length) {
            setState(first(urls));
        }
    }, [state, JSON.stringify(urls)]);

    const { loading: imageLoading } = useAsync(async () => {
        if (!state?.url) return;
        await fetch(state.url);
    }, [state?.url]);

    const { value, loading } = useAsync(async () => {
        if (!state?.themeId) return;
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
            publicKey: await FireflyRedPacket.createPublicKey(state?.themeId, account, payload),
            claimRequirements: payload,
        };
    }, [
        state?.themeId,
        requireCollection,
        rules,
        chainId,
        currentFarcasterProfile,
        currentLensProfile,
        currentTwitterProfile,
        account,
    ]);

    const shareFromName = isValidAddress(shareFrom)
        ? (shareFromEnsName ?? formatAddress(shareFrom, 4))
        : `${shareFrom}`;

    const [{ loading: createLoading }, handleCreate] = useCreateFTRedPacketCallback(
        shareFromName,
        value?.publicKey ?? '',
        value?.claimRequirements,
    );

    return (
        <>
            <div className="flex flex-1 flex-col gap-y-4 bg-primaryBottom px-4 pt-2">
                <div className="flex gap-x-4">
                    <div className="flex flex-1 flex-col gap-y-2">
                        <label className="self-start text-[14px] font-bold leading-[18px]">
                            <Trans>Cover background</Trans>
                        </label>

                        <Tabs value={coverType} onChange={setCoverType} variant="solid" className="self-start">
                            {redPacketCoverTabs.map((tab) => (
                                <Tab value={tab.value} key={tab.value}>
                                    {tab.label}
                                </Tab>
                            ))}
                        </Tabs>

                        <label className="self-start text-[14px] font-bold leading-[18px]">
                            <Trans>Data display</Trans>
                        </label>

                        <Tabs value={displayType} onChange={setDisplayType} variant="solid" className="self-start">
                            {redPacketDisplayTabs.map((tab) => (
                                <Tab
                                    value={tab.value}
                                    key={tab.value}
                                    disabled={tab.value === 'neutral' && coverType === 'default'}
                                >
                                    {tab.label}
                                </Tab>
                            ))}
                        </Tabs>

                        <label className="flex items-center self-start text-[14px] font-bold leading-[18px]">
                            <Trans>Share From</Trans>
                            <Tooltip
                                placement="top"
                                content={
                                    <Trans>
                                        Customize Lucky Drop sender. Select either Lens or Forecaster handle, or use the
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
                        <label className="flex h-[18px] justify-center text-[14px] font-bold text-secondary">
                            <Trans>Preview</Trans>
                        </label>
                        {state ? (
                            <>
                                {imageLoading || fetchUrlsLoading ? (
                                    <Loading className="!min-h-[154px] w-full" />
                                ) : (
                                    <Image
                                        width={220}
                                        height={154}
                                        alt={state.themeId}
                                        key={state.themeId}
                                        className="h-[154px] w-[220px] rounded-lg"
                                        unoptimized
                                        src={state.url}
                                    />
                                )}
                                <div className="flex justify-center gap-3">
                                    <ArrowCircle
                                        onClick={prev}
                                        className={classNames('h-6 w-6', {
                                            'text-third': isFirst,
                                            'text-second': !isFirst,
                                            'cursor-pointer': !isFirst,
                                            'cursor-not-allowed': isFirst,
                                        })}
                                    />
                                    <ArrowCircle
                                        onClick={next}
                                        style={{
                                            transform: 'rotate(180deg)',
                                        }}
                                        className={classNames('h-6 w-6', {
                                            'text-third': isLast,
                                            'text-second': !isLast,
                                            'cursor-pointer': !isLast,
                                            'cursor-not-allowed': isLast,
                                        })}
                                    />
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
                <div className="flex justify-between text-[14px] font-bold leading-[18px]">
                    <label>
                        <Trans>Drop type</Trans>
                    </label>
                    <span className="text-secondary">
                        {randomType === 'random' ? <Trans>Random Split</Trans> : <Trans>Equal Split</Trans>}
                    </span>
                </div>
                <div className="flex justify-between text-[14px] font-bold leading-[18px]">
                    <label>
                        <Trans>Number of winners</Trans>
                    </label>
                    <span className="text-secondary">{shares}</span>
                </div>
                <div className="flex justify-between text-[14px] font-bold leading-[18px]">
                    <label>
                        <Trans>Total amount</Trans>
                    </label>
                    <span className="text-secondary">
                        {totalAmount} {token?.symbol} {priceUSD ? `(${priceUSD})` : ''}
                    </span>
                </div>

                {rules.length ? (
                    <div className="flex justify-between text-[14px] font-bold leading-[18px]">
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

            <div className="dark:shadow-primaryDark w-full bg-lightBottom80 p-4 shadow-primary backdrop-blur-lg">
                <ActionButton className="rounded-lg" onClick={handleCreate} loading={createLoading || loading}>
                    <Trans>Next</Trans>
                </ActionButton>
            </div>
        </>
    );
}
