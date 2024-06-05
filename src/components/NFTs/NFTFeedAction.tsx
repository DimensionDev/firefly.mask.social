import { Trans } from '@lingui/macro';
import { formatAddress } from '@masknet/plugin-avatar';
import { isSameAddress } from '@masknet/web3-shared-base';
import { isValidAddress } from '@masknet/web3-shared-evm';
import { useMemo } from 'react';

import AcquiredIcon from '@/assets/nft-action/acquired.svg';
import BurnIcon from '@/assets/nft-action/burn.svg';
import BuyIcon from '@/assets/nft-action/buy.svg';
import MintIcon from '@/assets/nft-action/mint.svg';
import PoapIcon from '@/assets/nft-action/poap.svg';
import SellIcon from '@/assets/nft-action/sell.svg';
import SendIcon from '@/assets/nft-action/send.svg';
import { getFloorPrice } from '@/helpers/getFloorPrice.js';
import { type NFTActionCost, NFTFeedTransAction } from '@/providers/types/NFTs.js';

export interface NFTFeedActionProps {
    action: NFTFeedTransAction;
    ownerAddress?: string;
    toAddress?: string;
    fromAddress?: string;
    cost?: NFTActionCost;
}

export function NFTFeedAction({ action, ownerAddress, toAddress, fromAddress, cost }: NFTFeedActionProps) {
    // TODO: cost to usd
    const actionEl = useMemo(() => {
        switch (action) {
            case NFTFeedTransAction.Mint:
                return (
                    <>
                        <MintIcon width={18} height={18} />
                        <div className="text-second">
                            {cost ? (
                                <Trans>
                                    <span className="font-bold uppercase text-main">Minted</span> an NFT worth{' '}
                                    {getFloorPrice([{ value: cost.value, payment_token: cost }])}
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
                            <AcquiredIcon width={18} height={18} />
                            <div className="text-second">
                                {fromAddress ? (
                                    <Trans>
                                        <span className="font-bold uppercase text-main">Acquired</span> an NFT from{' '}
                                        <span className="font-bold text-main">
                                            {isValidAddress(fromAddress) ? formatAddress(fromAddress, 4) : toAddress}
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
                        <SendIcon width={18} height={18} />
                        <div className="text-second">
                            {toAddress ? (
                                <Trans>
                                    <span className="font-bold uppercase text-main">Sent</span> an NFT to{' '}
                                    <span className="font-bold text-main">
                                        {isValidAddress(toAddress) ? formatAddress(toAddress, 4) : toAddress}
                                    </span>
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
                        <BurnIcon width={18} height={18} />
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
                            <BuyIcon width={18} height={18} />
                            <div className="text-second">
                                {cost ? (
                                    <Trans>
                                        <span className="font-bold uppercase text-main">Bought</span> an NFT worth{' '}
                                        {getFloorPrice([{ value: cost.value, payment_token: cost }])}
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
                        <SellIcon width={18} height={18} />
                        <div className="text-second">
                            {cost ? (
                                <Trans>
                                    <span className="font-bold uppercase text-main">Sold</span> an NFT worth{' '}
                                    {getFloorPrice([{ value: cost.value, payment_token: cost }])}
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
                        <PoapIcon width={18} height={18} />
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

    return <div className="flex h-6 items-center space-x-1 text-[15px] leading-6">{actionEl}</div>;
}
