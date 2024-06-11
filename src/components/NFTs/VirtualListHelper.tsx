import { ChainId } from '@masknet/web3-shared-evm';
import { uniqBy } from 'lodash-es';
import { parseEther } from 'viem';

import { SingleNFTFeed } from '@/components/NFTs/SingleNFTFeed.js';
import { resolveSimpleHashChainId } from '@/helpers/resolveSimpleHashChain.js';
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
                action: {
                    action: feed.trans.action,
                    cost:
                        feed.trans.price > 0
                            ? {
                                  value: parseEther(`${feed.trans.price}`).toString(),
                                  symbol: 'ETH',
                                  decimals: 18,
                              }
                            : undefined,
                },
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
    const ownerAddress = nft.owner || nft.followingSources?.[0]?.walletAddress || '';
    return (
        <SingleNFTFeed
            key={`${nft.hash}-${index}`}
            listKey={listKey}
            chainId={chainId}
            ownerAddress={ownerAddress}
            displayInfo={nft.displayInfo}
            tokenList={uniqBy(nft.actions, 'token_id').map(
                ({ token_id, contract_address, address_to, address_from, cost }) => ({
                    id: token_id,
                    contractAddress: contract_address,
                    action: {
                        action: nft.type,
                        toAddress: address_to,
                        fromAddress: address_from,
                        ownerAddress,
                        cost,
                    },
                }),
            )}
            time={nft.timestamp}
        />
    );
}
