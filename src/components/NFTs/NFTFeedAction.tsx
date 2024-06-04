import { Trans } from '@lingui/macro';
import { formatAddress } from '@masknet/plugin-avatar';
import { isValidAddress } from '@masknet/web3-shared-evm';
import { useMemo } from 'react';

import MintIcon from '@/assets/nft-action/mint.svg';
import SendIcon from '@/assets/nft-action/send.svg';
import { NFTFeedTransAction } from '@/providers/types/NFTs.js';

export interface NFTFeedActionProps {
    action: NFTFeedTransAction;
    transferTo?: string;
}

export function NFTFeedAction({ action, transferTo }: NFTFeedActionProps) {
    const actionEl = useMemo(() => {
        switch (action) {
            case NFTFeedTransAction.Mint:
                return (
                    <>
                        <MintIcon width={18} height={18} />
                        <div className="text-second">
                            <Trans>
                                <span className="font-bold uppercase text-main">Minted</span> an NFT
                            </Trans>
                        </div>
                    </>
                );
            case NFTFeedTransAction.Transfer:
                return (
                    <>
                        <SendIcon width={18} height={18} />
                        <div className="text-second">
                            {transferTo ? (
                                <Trans>
                                    <span className="font-bold uppercase text-main">Sent</span> an NFT to{' '}
                                    <span className="font-bold text-main">
                                        {isValidAddress(transferTo) ? formatAddress(transferTo, 4) : transferTo}
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
            case NFTFeedTransAction.Burn: // TODO
            case NFTFeedTransAction.Trade: // TODO
            case NFTFeedTransAction.Acquired: // TODO
                return action;
            default:
                return null;
        }
    }, [action, transferTo]);

    return <div className="flex h-6 items-center space-x-1 text-[15px] leading-6">{actionEl}</div>;
}
