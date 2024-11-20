import { type BaseHubOptions, SimpleHash } from '@masknet/web3-providers/types';
import type { NonFungibleAsset } from '@masknet/web3-shared-base';

import type { Pageable, PageIndicator } from '@/helpers/pageable.js';

export type SimpleHashCollection = SimpleHash.Collection & {
    chains?: string[];
};

export interface Provider<ChainId, SchemaType> {
    /**
     * Retrieves a specific NFT asset by its contract address and token ID.
     * @param address
     * @param tokenId
     */
    getNFT(
        address: string,
        tokenId: string,
        options?: BaseHubOptions<ChainId>,
        skipScoreCheck?: boolean,
    ): Promise<NonFungibleAsset<ChainId, SchemaType> | null>;

    /**
     * Retrieves all NFTs from a specific collection.
     * @param contractAddress
     */
    getNFTs(
        contractAddress: string,
        options?: BaseHubOptions<ChainId>,
        skipScoreCheck?: boolean,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>, PageIndicator>>;

    /**
     * Retrieves all NFTs from a specific collection ID.
     * @param collectionId
     * @param owner
     */
    getNFTsByCollectionId(
        collectionId: string,
        options?: BaseHubOptions<ChainId>,
        skipScoreCheck?: boolean,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>, PageIndicator>>;

    /**
     * Retrieves all POAPs owned by a specific address.
     * @param address
     * @returns
     */
    getPOAPs(
        address: string,
        options?: BaseHubOptions<ChainId> & { contractAddress?: string },
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>, PageIndicator | undefined>>;

    /**
     * Retrieves a collection by its contract address.
     * @param contractAddress
     */
    getCollection(contractAddress: string, options?: BaseHubOptions<ChainId>): Promise<SimpleHashCollection | null>;

    /**
     * Retrieves a collection by its ID.
     * @param collectionId
     */
    getCollectionById(collectionId: string): Promise<SimpleHashCollection | null>;

    /**
     * Retrieves the top collectors of a collection.
     * @param contractAddress
     */
    getTopCollectors(
        contractAddress: string,
        options?: BaseHubOptions<ChainId>,
    ): Promise<Pageable<SimpleHash.TopCollector, PageIndicator>>;

    /**
     * Retrieves a POAP event by its ID.
     * @param eventId
     */
    getPoapEvent(
        eventId: number,
        options?: Omit<BaseHubOptions<ChainId>, 'chainId'>,
    ): Promise<Pageable<SimpleHash.Asset, PageIndicator | undefined>>;

    getNFTsByCollectionIdAndOwner(
        collectionId: string,
        owner: string,
        options?: BaseHubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>, PageIndicator>>;
}
