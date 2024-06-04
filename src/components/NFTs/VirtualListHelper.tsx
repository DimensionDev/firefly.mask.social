import { ChainId } from '@masknet/web3-shared-evm';

import { SingleNFTFeed } from '@/components/NFTs/SingleNFTFeed.js';
import { resolveSimpleHashChainId } from '@/helpers/resolveSimpleHashChainId.js';
import type { FollowingNFT, NFTFeed } from '@/providers/types/NFTs.js';

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
            tokenList={feed.trans.token_list.map(({ id }) => ({
                id,
                contractAddress: feed.trans.token_address,
                action: feed.trans.action,
            }))}
            time={feed.trans.time * 1000}
            ownerAddress={feed.address}
        />
    );
}

export function getSingleFollowingNFTItemContent(
    index: number,
    nft: FollowingNFT,
    {
        listKey,
    }: {
        listKey?: string;
    } = {},
) {
    const chainId = resolveSimpleHashChainId(nft.network) ?? ChainId.Mainnet;
    const ownerAddress = nft.followingSources?.[0]?.walletAddress ?? '';
    return (
        <SingleNFTFeed
            key={`${nft.hash}-${index}`}
            listKey={listKey}
            chainId={chainId}
            ownerAddress={ownerAddress}
            displayInfo={nft.displayInfo}
            tokenList={nft.actions.map(({ token_id, contract_address, type }) => ({
                id: token_id,
                contractAddress: contract_address,
                action: type,
                transferTo: nft.address_to,
            }))}
            time={nft.timestamp}
        />
    );
}
