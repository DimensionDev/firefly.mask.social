import { SimpleHashSolana } from '@masknet/web3-providers';
import type { BaseHubOptions, SimpleHash } from '@masknet/web3-providers/types';
import type { NonFungibleAsset } from '@masknet/web3-shared-base';
import type { ChainId, SchemaType } from '@masknet/web3-shared-solana';

import type { Pageable, PageIndicator } from '@/helpers/pageable.js';
import type { Provider, SimpleHashCollection } from '@/providers/types/WalletProfile.js';

class SimpleHashSolanaWalletProfile implements Provider<ChainId, SchemaType> {
    async getNFT(
        address: string,
        tokenId: string,
        options?: BaseHubOptions<ChainId>,
    ): Promise<NonFungibleAsset<ChainId, SchemaType> | null> {
        const asset = await SimpleHashSolana.getAsset(address, tokenId, options);
        return asset || null;
    }

    getNFTs(contractAddress: string, options?: BaseHubOptions<ChainId>, skipScoreCheck = false) {
        return SimpleHashSolana.getAssetsByCollection(contractAddress, options);
    }

    getNFTsByCollectionId(collectionId: string, options?: BaseHubOptions<ChainId>) {
        return SimpleHashSolana.getAssetsByCollectionId(collectionId, options);
    }

    getNFTsByCollectionIdAndOwner(collectionId: string, owner: string, options?: BaseHubOptions<ChainId>) {
        return SimpleHashSolana.getAssetsByCollectionAndOwner(collectionId, owner, options);
    }

    getPOAPs(address: string, options?: BaseHubOptions<ChainId> & { contractAddress?: string }) {
        return SimpleHashSolana.getAssets(address, options);
    }

    async getCollection(
        contractAddress: string,
        options?: BaseHubOptions<ChainId>,
    ): Promise<SimpleHashCollection | null> {
        const collection = await SimpleHashSolana.getCollectionByContractAddress(contractAddress, options);
        return collection || null;
    }

    async getCollectionById(collectionId: string): Promise<SimpleHashCollection | null> {
        const collection = await SimpleHashSolana.getSimpleHashCollection(collectionId);
        return collection || null;
    }

    async getTopCollectors(
        collectionId: string,
        options?: BaseHubOptions<ChainId>,
    ): Promise<Pageable<SimpleHash.TopCollector, PageIndicator>> {
        const response = await SimpleHashSolana.getTopCollectorsByCollectionId(collectionId, options);
        return response as Pageable<SimpleHash.TopCollector, PageIndicator>;
    }

    async getPoapEvent(eventId: number, options: Omit<BaseHubOptions<ChainId>, 'chainId'> = {}) {
        return SimpleHashSolana.getPoapEvent(eventId, options);
    }
}

export const SimpleHashSolanaWalletProfileProvider = new SimpleHashSolanaWalletProfile();
