'use client';

import { Trans } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';
import { useContext, useMemo } from 'react';
import type { Address } from 'viem';
import { useEnsName } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import { ActivityContext } from '@/components/CZ/ActivityContext.js';
import { ActivityHomePageButton } from '@/components/CZ/ActivityHomePageButton.js';
import { useActivityCheckResponse } from '@/components/CZ/useActivityCheckResponse.js';
import { Image } from '@/esm/Image.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { Level } from '@/providers/types/CZ.js';

export function ActivityHomePage() {
    const { type, address, isLoggedTwitter, isLoading: isLoadingContext, isEnded } = useContext(ActivityContext);
    const { data, isLoading, error, refetch, isRefetching } = useActivityCheckResponse();
    const { data: ens } = useEnsName({ address: address as Address, chainId: ChainId.Mainnet });
    const { title, description } = useMemo(() => {
        if (data?.eventEnds) {
            return {
                title: <Trans>Event ended</Trans>,
                description: null,
            };
        }
        if (!isLoggedTwitter) {
            return {
                title: <Trans>Reward for followers</Trans>,
                description: (
                    <Trans>
                        Get a free special edition Firefly NFT for following @cz_binance on X to celebrate CZ’s return!
                    </Trans>
                ),
            };
        }
        if (!address) {
            return {
                title: <Trans>Almost there!</Trans>,
                description: <Trans>Connect your wallet to claim your NFT.</Trans>,
            };
        }
        if (data?.alreadyClaimed) {
            return {
                title: <Trans>Already claimed</Trans>,
                description: <Trans>Each wallet or X account is limited to one claim.</Trans>,
            };
        }
        if (type === 'page') {
            return {
                title: <Trans>Welcome Back CZ Collectible</Trans>,
                description: (
                    <Trans>
                        Get a free special edition Firefly NFT for following @cz_binance on X to celebrate CZ’s return!
                    </Trans>
                ),
            };
        }
        if (data?.canClaim) {
            const title = <Trans>{ens ?? formatAddress(address, 4)} is eligible!</Trans>;
            if (data.level === Level.Lv2) {
                if (data.x?.valid && data.x.level === Level.Lv2) {
                    return {
                        title,
                        description: (
                            <Trans>
                                You&apos;re eligible for a <b>Premium</b> CZ Support NFT because your X account holds
                                Premium status.
                            </Trans>
                        ),
                    };
                }
                if (data.bnbBalance?.valid && data.bnbBalance.level === Level.Lv2) {
                    return {
                        title,
                        description: (
                            <Trans>
                                You&apos;re eligible for a <b>Premium</b> CZ Support NFT because your BNB Chain wallet
                                holds assets valued over <b>$10,000</b>.
                            </Trans>
                        ),
                    };
                }
                if (data.bnbId?.valid && data.bnbId.level === Level.Lv2) {
                    return {
                        title,
                        description: (
                            <Trans>
                                You&apos;re eligible for a <b>Premium</b> CZ Support NFT because your .bnb domain is
                                member of the <b>SPACE ID Premier Club</b>.
                            </Trans>
                        ),
                    };
                }
            }
            return {
                title,
                description: <Trans>Claim your NFT to show your support onchain for CZ!</Trans>,
            };
        }
        return {
            title: <Trans>Not eligible</Trans>,
            description: <Trans>Must followed @cz_binance on X before Sept 21, 2024.</Trans>,
        };
    }, [
        isLoggedTwitter,
        address,
        data?.eventEnds,
        data?.alreadyClaimed,
        data?.canClaim,
        data?.level,
        data?.bnbBalance?.valid,
        data?.bnbId?.valid,
        data?.x?.valid,
        data?.x?.level,
        data?.bnbBalance?.level,
        data?.bnbId?.level,
        ens,
        type,
    ]);

    if (isEnded) {
        return (
            <div className="flex h-[317px] w-full flex-col items-center space-y-8">
                <Image
                    src={
                        data?.level === Level.Lv2 ? '/image/activity/cz/premium-nft.png' : '/image/activity/cz/nft.png'
                    }
                    width={162}
                    height={162}
                    alt="cz-nft"
                />
                <div className="flex flex-col space-y-1 text-center leading-[90%]">
                    <h3 className="text-xl font-bold">
                        <Trans>
                            Event ended
                        </Trans>
                    </h3>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[317px] w-full flex-col items-center">
                <Image
                    src="/image/radar.png"
                    width={200}
                    height={106}
                    className="my-auto"
                    alt="Something went wrong. Please try again."
                />
                <p className="my-6 text-center text-xl font-bold leading-[18px]">
                    <Trans>Something went wrong, Please try again.</Trans>
                </p>
                <button
                    className="mt-auto h-10 rounded-full bg-white px-[18px] text-sm font-bold leading-10 text-[#181a20] disabled:opacity-70"
                    onClick={() => refetch()}
                    disabled={isRefetching}
                >
                    <Trans>Refresh</Trans>
                </button>
            </div>
        );
    }

    if (isLoading || isLoadingContext) {
        return (
            <div className="flex h-[317px] w-full flex-col items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                    <LoadingIcon className="animate-spin" width={36} height={36} />
                    {type === 'dialog' ? (
                        <p className="text-sm leading-[18px]">
                            <Trans>Checking eligibility</Trans>
                        </p>
                    ) : null}
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col items-center space-y-8">
            <Image
                src={data?.level === Level.Lv2 ? '/image/activity/cz/premium-nft.png' : '/image/activity/cz/nft.png'}
                width={162}
                height={162}
                alt="cz-nft"
            />
            <div className="flex flex-col space-y-1 text-center leading-[90%]">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-sm font-normal">{description}</p>
            </div>
            <div className="flex flex-col space-y-1.5 text-center">
                <ActivityHomePageButton />
            </div>
        </div>
    );
}
