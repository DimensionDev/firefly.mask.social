import { ChainId } from '@masknet/web3-shared-evm';

import { SingleNFTFeed } from '@/components/NFTs/SingleNFTFeed.js';
import type { NFTFeed } from '@/providers/types/NFTs.js';

export function getSingleNFTFeedItemContent(
    index: number,
    feed: NFTFeed,
    {
        chainId = ChainId.Mainnet,
        listKey,
    }: {
        listKey?: string;
        chainId?: ChainId;
    } = {},
) {
    return (
        <SingleNFTFeed
            key={`${feed.id}-${index}`}
            listKey={listKey}
            chainId={chainId}
            displayInfo={feed.displayInfo}
            tokenList={feed.trans.token_list}
            time={feed.trans.time * 1000}
            contractAddress={feed.trans.token_address}
            action={feed.trans.action}
        />
    );
}
