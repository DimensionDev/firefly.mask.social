import { Trans } from '@lingui/macro';
import { useMemo } from 'react';

import AcquiredIcon from '@/assets/nft-action/acquired.svg';
import BurnIcon from '@/assets/nft-action/burn.svg';
import BuyIcon from '@/assets/nft-action/buy.svg';
import MintIcon from '@/assets/nft-action/mint.svg';
import PoapIcon from '@/assets/nft-action/poap.svg';
import SellIcon from '@/assets/nft-action/sell.svg';
import SendIcon from '@/assets/nft-action/send.svg';
import { TokenPrice } from '@/components/TokenPrice.js';
import { formatBalance } from '@/helpers/formatBalance.js';
import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';
import { isSameAddress } from '@/helpers/isSameAddress.js';
import { resolveCoinGeckoTokenSymbol } from '@/helpers/resolveCoinGeckoTokenSymbol.js';
import { type NFTActionCost, NFTFeedTransAction } from '@/providers/types/NFTs.js';

export interface NFTFeedActionProps {
    action: NFTFeedTransAction;
    ownerAddress?: string;
    toAddress?: string;
    fromAddress?: string;
    cost?: NFTActionCost;
}

export function NFTFeedAction({ action, ownerAddress, toAddress, fromAddress, cost }: NFTFeedActionProps) {
    const iconSize = 18;
    const actionEl = useMemo(() => {
        const costEl = cost ? (
            <>
                {`${formatBalance(cost.value, cost.decimals, {
                    isFixed: true,
                })} ${cost.symbol}`}
                <TokenPrice
                    target="usd"
                    prefix=" ($"
                    suffix=")"
                    value={cost.value}
                    decimals={cost.decimals}
                    symbol={resolveCoinGeckoTokenSymbol(cost.symbol)}
                />
            </>
        ) : null;

        switch (action) {
            case NFTFeedTransAction.Mint:
                return (
                    <>
                        <MintIcon width={iconSize} height={iconSize} className="mb-auto mt-[3px] min-w-[18px]" />
                        <div className="text-second">
                            {cost ? (
                                <Trans>
                                    <span className="font-bold uppercase text-main">Minted</span> an NFT worth {costEl}
                                </Trans>
                            ) : (
                                <Trans>
                                    <span className="font-bold uppercase text-main">Minted</span> an NFT for free
                                </Trans>
                            )}
                        </div>
                    </>
                );
            case NFTFeedTransAction.Transfer:
                if (isSameAddress(toAddress, ownerAddress)) {
                    return (
                        <>
                            <AcquiredIcon
                                width={iconSize}
                                height={iconSize}
                                className="mb-auto mt-[3px] min-w-[18px]"
                            />
                            <div className="text-second">
                                {fromAddress ? (
                                    <Trans>
                                        <span className="font-bold uppercase text-main">Acquired</span> an NFT from{' '}
                                        <span className="font-bold text-main">
                                            {formatEthereumAddress(fromAddress, 4)}
                                        </span>
                                    </Trans>
                                ) : (
                                    <Trans>
                                        <span className="font-bold uppercase text-main">Acquired</span> an NFT
                                    </Trans>
                                )}
                            </div>
                        </>
                    );
                }
                return (
                    <>
                        <SendIcon width={iconSize} height={iconSize} className="mb-auto mt-[3px] min-w-[18px]" />
                        <div className="text-second">
                            {toAddress ? (
                                <Trans>
                                    <span className="font-bold uppercase text-main">Sent</span> an NFT to{' '}
                                    <span className="font-bold text-main">{formatEthereumAddress(toAddress, 4)}</span>
                                </Trans>
                            ) : (
                                <Trans>
                                    <span className="font-bold uppercase text-main">Sent</span> an NFT
                                </Trans>
                            )}
                        </div>
                    </>
                );
            case NFTFeedTransAction.Burn:
                return (
                    <>
                        <BurnIcon width={iconSize} height={iconSize} className="mb-auto mt-[3px] min-w-[18px]" />
                        <div className="text-second">
                            <Trans>
                                <span className="font-bold uppercase text-main">Burned</span> an NFT
                            </Trans>
                        </div>
                    </>
                );
            case NFTFeedTransAction.Trade:
                if (isSameAddress(toAddress, ownerAddress)) {
                    return (
                        <>
                            <BuyIcon width={iconSize} height={iconSize} className="mb-auto mt-[3px] min-w-[18px]" />
                            <div className="text-second">
                                {cost ? (
                                    <Trans>
                                        <span className="font-bold uppercase text-main">Bought</span> an NFT worth{' '}
                                        {costEl}
                                    </Trans>
                                ) : (
                                    <Trans>
                                        <span className="font-bold uppercase text-main">Bought</span> an NFT
                                    </Trans>
                                )}
                            </div>
                        </>
                    );
                }
                return (
                    <>
                        <SellIcon width={iconSize} height={iconSize} className="mb-auto mt-[3px] min-w-[18px]" />
                        <div className="text-second">
                            {cost ? (
                                <Trans>
                                    <span className="font-bold uppercase text-main">Sold</span> an NFT worth {costEl}
                                </Trans>
                            ) : (
                                <Trans>
                                    <span className="font-bold uppercase text-main">Sold</span> an NFT
                                </Trans>
                            )}
                        </div>
                    </>
                );
            case NFTFeedTransAction.Poap:
                return (
                    <>
                        <PoapIcon width={iconSize} height={iconSize} className="mb-auto mt-[3px] min-w-[18px]" />
                        <div className="text-second">
                            <Trans>
                                <span className="font-bold uppercase text-main">Poap</span> received
                            </Trans>
                        </div>
                    </>
                );
            default:
                return null;
        }
    }, [action, ownerAddress, toAddress, fromAddress, cost]);

    return <div className="flex min-h-6 items-center space-x-1 text-medium leading-6">{actionEl}</div>;
}
