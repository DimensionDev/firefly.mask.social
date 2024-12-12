import { Trans } from '@lingui/macro';
import { formatCurrency } from '@masknet/web3-shared-base';
import { isValidAddress } from '@masknet/web3-shared-evm';
import { BigNumber } from 'bignumber.js';
import { compact, flatten } from 'lodash-es';
import { useContext, useMemo } from 'react';
import { useAsync } from 'react-use';
import { useEnsName } from 'wagmi';

import ArrowDownIcon from '@/assets/arrow-down.svg';
import InfoIcon from '@/assets/info.svg';
import QuestionIcon from '@/assets/question.svg';
import { ActionButton } from '@/components/ActionButton.js';
import { Tab, Tabs } from '@/components/Tabs/index.js';
import { Tooltip } from '@/components/Tooltip.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { useCreateFTRedPacketCallback } from '@/hooks/useCreateFTRedPacketCallback.js';
import { useFungibleTokenPrice } from '@/hooks/useFungibleTokenPrice.js';
import { useProfileStoreAll } from '@/hooks/useProfileStore.js';
import { DEFAULT_THEME_ID } from '@/mask/plugins/red-packet/constants.js';
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
            // TODO: replace the theme id
            publicKey: await FireflyRedPacket.createPublicKey(DEFAULT_THEME_ID, account, payload),
            claimRequirements: payload,
        };
    }, [
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
                                <Tab value={tab.value} key={tab.value}>
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
                    <div className="w-[220px]">{/* TODO: cover */}</div>
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

            <div className="w-full bg-lightBottom80 p-4 shadow-primary backdrop-blur-lg dark:shadow-primaryDark">
                <ActionButton className="rounded-lg" onClick={handleCreate} loading={createLoading || loading}>
                    <Trans>Next</Trans>
                </ActionButton>
            </div>
        </>
    );
}
