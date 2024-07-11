import type { BaseHubOptions, SimpleHash } from '@masknet/web3-providers/types';
import type { NonFungibleAsset } from '@masknet/web3-shared-base';

import type { ChainId, SchemaType } from '@/constants/ethereum.js';
import type { Pageable, PageIndicator } from '@/helpers/pageable.js';

export interface Provider {
    /**
     * Retrieves a specific NFT asset by its contract address and token ID.
     * @param address
     * @param tokenId
     */
    getNFT(
        address: string,
        tokenId: string,
        options?: BaseHubOptions<ChainId>,
    ): Promise<NonFungibleAsset<ChainId, SchemaType> | null>;

    /**
     * Retrieves all NFTs from a specific collection.
     * @param contractAddress
     */
    getNFTs(
        contractAddress: string,
        options?: BaseHubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>>;

    /**
     * Retrieves all POAPs owned by a specific address.
     * @param address
     * @returns
     */
    getPOAPs(
        address: string,
        options?: BaseHubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>>;

    /**
     * Retrieves a collection by its contract address.
     * @param contractAddress
     */
    getCollection(contractAddress: string): Promise<SimpleHash.Collection | null>;

    /**
     * Retrieves the top collectors of a collection.
     * @param contractAddress
     */
    getTopCollectors(
        contractAddress: string,
        options?: BaseHubOptions<ChainId>,
    ): Promise<Pageable<SimpleHash.TopCollector, PageIndicator>>;
}
