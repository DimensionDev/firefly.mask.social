import { Trans } from '@lingui/macro';

import MintIcon from '@/assets/nft-action/mint.svg';
import { NFTFeedTransAction } from '@/providers/types/NFTs.js';

export function NFTFeedAction({ action }: { action: NFTFeedTransAction }) {
    switch (action) {
        case NFTFeedTransAction.Mint:
            return (
                <div className="flex items-center space-x-1 text-[15px] leading-6">
                    <MintIcon width={18} height={18} />
                    <div className="font-bold uppercase">
                        <Trans>Minted </Trans>
                    </div>
                    <div> an NFT </div>
                    {/*  TODO: price  */}
                </div>
            );
        case NFTFeedTransAction.Burn: // TODO
        case NFTFeedTransAction.Transfer: // TODO
        case NFTFeedTransAction.Trade: // TODO
        default:
            return null;
    }
}
