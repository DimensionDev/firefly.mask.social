import type { NonFungibleAsset } from '@masknet/web3-shared-base';
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm';

import type { Pageable, PageIndicator } from '@/helpers/pageable.js';
import type { BaseHubOptions, SimpleHash } from '@/mask/bindings/index.js';
import { SimpleHashEVM } from '@/mask/bindings/index.js';
import type { Provider, SimpleHashCollection } from '@/providers/types/WalletProfile.js';

class SimpleHashEVMWalletProfile implements Provider<ChainId, SchemaType> {
    async getNFT(
        address: string,
        tokenId: string,
        options?: BaseHubOptions<ChainId>,
        skipScoreCheck = false,
    ): Promise<NonFungibleAsset<ChainId, SchemaType> | null> {
        const asset = await SimpleHashEVM.getAsset(address, tokenId, options, skipScoreCheck);
        return asset || null;
    }

    getNFTs(contractAddress: string, options?: BaseHubOptions<ChainId>, skipScoreCheck = false) {
        return SimpleHashEVM.getAssetsByCollection(contractAddress, options, skipScoreCheck);
    }

    getNFTsByCollectionId(collectionId: string, options?: BaseHubOptions<ChainId>, skipScoreCheck = false) {
        return SimpleHashEVM.getAssetsByCollectionId(collectionId, options, skipScoreCheck);
    }

    getNFTsByCollectionIdAndOwner(collectionId: string, owner: string, options?: BaseHubOptions<ChainId>) {
        return SimpleHashEVM.getAssetsByCollectionAndOwner(collectionId, owner, options);
    }

    getPOAPs(address: string, options?: BaseHubOptions<ChainId> & { contractAddress?: string }) {
        return SimpleHashEVM.getAssets(address, options);
    }

    async getCollection(
        contractAddress: string,
        options?: BaseHubOptions<ChainId>,
    ): Promise<SimpleHashCollection | null> {
        const collection = await SimpleHashEVM.getCollectionByContractAddress(contractAddress, options);
        return collection || null;
    }

    async getCollectionById(collectionId: string): Promise<SimpleHashCollection | null> {
        const collection = await SimpleHashEVM.getSimpleHashCollection(collectionId);
        return collection || null;
    }

    async getTopCollectors(collectionId: string, options?: BaseHubOptions<ChainId>) {
        const response = await SimpleHashEVM.getTopCollectorsByCollectionId(collectionId, options);
        return response as Pageable<SimpleHash.TopCollector, PageIndicator>;
    }

    async getPoapEvent(eventId: number, options: Omit<BaseHubOptions<ChainId>, 'chainId'> = {}) {
        return SimpleHashEVM.getPoapEvent(eventId, options);
    }
}

export const SimpleHashEVMWalletProfileProvider = new SimpleHashEVMWalletProfile();
