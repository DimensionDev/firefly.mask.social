import { ChainId as EVMChainId, SchemaType } from '@masknet/web3-shared-evm';
import { compact } from 'lodash-es';
import urlcat from 'urlcat';

import type { NFTMarketplace } from '@/constants/enum.js';
import { EMPTY_LIST, SIMPLE_HASH_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { createIndicator, createNextIndicator, createPageable, type PageIndicator } from '@/helpers/pageable.js';
import { resolveSimpleHashChain } from '@/helpers/resolveSimpleHashChain.js';
import type { BaseHubOptions } from '@/mask/bindings/index.js';
import { formatSimpleHashNFT } from '@/providers/simplehash/formatSimpleHashNFT.js';
import type {
    Collection,
    CollectionDetails,
    NFTAsset,
    NFTOwnership,
    NftPreview,
    NftPreviewCollection,
    TopCollector,
} from '@/providers/types/Firefly.js';

class SimpleHash {
    async getWalletsNFTCollections(
        params: { limit?: number; indicator?: PageIndicator; walletAddress: string },
        chains: string,
    ) {
        const { indicator, walletAddress, limit } = params ?? {};
        const url = urlcat(SIMPLE_HASH_URL, '/api/v0/nfts/collections_by_wallets_v2', {
            chains,
            wallet_addresses: walletAddress,
            limit: limit || 25,
            cursor: indicator?.id || undefined,
            nft_ids: '1',
            include_escrowed_nfts: '1',
        });

        const response = await fetchJSON<{ collections: Collection[]; next_cursor?: string }>(url);
        return createPageable(
            response?.collections ?? EMPTY_LIST,
            createIndicator(indicator),
            response?.next_cursor ? createNextIndicator(indicator, `${response.next_cursor}`) : undefined,
        );
    }

    async getNFTByIds(nftIds: string[]) {
        const url = urlcat(SIMPLE_HASH_URL, '/api/v0/nfts/assets', {
            nft_ids: nftIds.join(','),
        });

        const response = await fetchJSON<{ nfts: NftPreview[] }>(url);
        return response?.nfts ?? EMPTY_LIST;
    }

    async getWalletsNFTCollectionsWithNFTs(
        params: { limit?: number; indicator?: PageIndicator; walletAddress: string },
        chains: string,
    ) {
        const response = await SimpleHashProvider.getWalletsNFTCollections(params, chains);
        const nftIds = response.data.flatMap((collection) => collection.nft_ids ?? []);
        const nfts = nftIds.length ? await SimpleHashProvider.getNFTByIds(nftIds) : [];

        return {
            ...response,
            data: nfts.length
                ? response.data.map((collection) => {
                      return {
                          ...collection,
                          nftPreviews: nfts.filter((nft) => collection.nft_ids?.includes(nft.nft_id)),
                      };
                  })
                : response.data,
        };
    }

    async getNFTCollectionsByMarket(props: {
        marketplace: NFTMarketplace;
        chains?: string;
        slugs?: string;
        limit?: number;
        indicator?: PageIndicator;
    }) {
        const url = urlcat(SIMPLE_HASH_URL, '/api/v0/nfts/collections/marketplace/:marketplace', {
            marketplace: props.marketplace,
            chains: props.chains || 'ethereum',
            slugs: props.slugs,
            limit: props.limit || 25,
            cursor: props.indicator?.id || undefined,
        });
        const response = await fetchJSON<{ collections: NftPreviewCollection[]; next_cursor?: string }>(url);

        return createPageable(
            response?.collections ?? EMPTY_LIST,
            createIndicator(props.indicator),
            response?.next_cursor ? createNextIndicator(props.indicator, `${response.next_cursor}`) : undefined,
        );
    }

    async getNFTByAddress(address: string, tokenId: string, chain: string) {
        const url = urlcat(SIMPLE_HASH_URL, '/api/v0/nfts/:chain/:address/:tokenId', {
            chain,
            address,
            tokenId,
        });

        const response = await fetchJSON<NftPreview>(url);

        return response;
    }

    async getNFT(
        address: string,
        tokenId: string,
        options?: BaseHubOptions<number>,
        skipScoreCheck = false,
    ): Promise<NFTAsset<number, number> | null> {
        const chain = resolveSimpleHashChain(options?.chainId || EVMChainId.Mainnet);
        if (!chain || !address || !tokenId) return null;
        const path = urlcat(SIMPLE_HASH_URL, '/api/v0/nfts/:chain/:address/:tokenId', {
            chain,
            address,
            tokenId,
        });
        const response = await fetchJSON<NftPreview>(path);
        const asset = formatSimpleHashNFT(response, skipScoreCheck);

        if (chain !== 'solana' && asset?.schema === SchemaType.ERC1155 && options?.account) {
            const pathToQueryOwner = urlcat(SIMPLE_HASH_URL, '/api/v0/nfts/contracts', {
                chains: chain,
                wallet_addresses: options.account,
                contract_addresses: asset.address,
            });

            const ownershipResponse = await fetchJSON<{ wallets: NFTOwnership[] }>(pathToQueryOwner);

            if (ownershipResponse.wallets?.[0]?.contracts?.[0].token_ids?.includes(asset.tokenId)) {
                asset.owner = { address: options.account };
            }
        }

        return asset || null;
    }

    async getNFTs(contractAddress: string, options?: BaseHubOptions<number>, skipScoreCheck = false) {
        const indicator = options?.indicator;
        const chain = resolveSimpleHashChain(options?.chainId || EVMChainId.Mainnet);
        if (!chain || !contractAddress) {
            return createPageable(EMPTY_LIST, createIndicator(indicator));
        }

        const path = urlcat(SIMPLE_HASH_URL, `/api/v0/nfts/${chain}/:address`, {
            address: contractAddress,
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
        });

        const response = await fetchJSON<{ next_cursor: string; nfts: NftPreview[] }>(path);

        const assets = compact(response.nfts.map((x) => formatSimpleHashNFT(x, skipScoreCheck)));

        return createPageable(
            assets,
            createIndicator(indicator),
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
        );
    }

    async getNFTsByCollectionId(collectionId: string, options?: BaseHubOptions<number>, skipScoreCheck = false) {
        const indicator = options?.indicator;
        const chain = resolveSimpleHashChain(options?.chainId || EVMChainId.Mainnet);
        if (!collectionId || !chain) {
            return createPageable(EMPTY_LIST, createIndicator(indicator));
        }
        const path = urlcat(SIMPLE_HASH_URL, '/api/v0/nfts/collection/:collectionId', {
            chains: chain,
            collectionId,
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
        });

        const response = await fetchJSON<{ next_cursor: string; nfts: NftPreview[] }>(path);
        const assets = compact(response.nfts.map((x) => formatSimpleHashNFT(x, skipScoreCheck)));

        return createPageable(
            assets,
            createIndicator(indicator),
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
        );
    }

    async getNFTsByCollectionIdAndOwner(collectionId: string, owner: string, options?: BaseHubOptions<number>) {
        const indicator = options?.indicator;
        const chain = resolveSimpleHashChain(options?.chainId || EVMChainId.Mainnet);
        if (!chain || !collectionId || !owner) return createPageable(EMPTY_LIST, createIndicator(indicator));

        const path = urlcat(SIMPLE_HASH_URL, '/api/v0/nfts/owners', {
            chains: chain,
            wallet_addresses: owner,
            collection_ids: collectionId,
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
            limit: options?.size || 50,
        });

        const response = await fetchJSON<{ nfts: NftPreview[]; next_cursor: string }>(path);

        const assets = compact(response.nfts.map((x) => formatSimpleHashNFT(x)));

        return createPageable(
            assets,
            createIndicator(indicator),
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
        );
    }

    async getPOAPs(address: string, options?: BaseHubOptions<number> & { contractAddress?: string }) {
        const indicator = options?.indicator;
        const chain = resolveSimpleHashChain(options?.chainId || EVMChainId.Mainnet);
        if (!address || !chain) {
            return createPageable(EMPTY_LIST, createIndicator(indicator));
        }
        const path = urlcat(SIMPLE_HASH_URL, '/api/v0/nfts/owners', {
            chains: chain,
            wallet_addresses: address,
            contract_addresses: options?.contractAddress,
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
        });

        const response = await fetchJSON<{ next_cursor: string; nfts: NftPreview[] }>(path);
        const assets = compact(response.nfts.map((x) => formatSimpleHashNFT(x)));

        return createPageable(
            assets,
            indicator,
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
        );
    }

    async getCollection(contractAddress: string, options?: BaseHubOptions<number>): Promise<CollectionDetails | null> {
        const chain = resolveSimpleHashChain(options?.chainId || EVMChainId.Mainnet);
        if (!chain || !contractAddress) return null;
        const path = urlcat(SIMPLE_HASH_URL, '/api/v0/nfts/collections/:chain/:address', {
            chain,
            address: contractAddress,
        });

        const { collections } = await fetchJSON<{ collections: CollectionDetails[] }>(path);

        return collections[0];
    }

    async getCollectionById(collectionId: string): Promise<CollectionDetails | null> {
        const path = urlcat(SIMPLE_HASH_URL, '/api/v0/nfts/collections/ids', {
            collection_ids: collectionId,
        });
        const response = await fetchJSON<{ collections: CollectionDetails[] }>(path);
        return response.collections[0];
    }

    async getTopCollectors(collectionId: string, options?: BaseHubOptions<number>) {
        const indicator = options?.indicator;
        const path = urlcat(SIMPLE_HASH_URL, '/api/v0/nfts/top_collectors/collection/:collectionId', {
            collectionId,
            cursor: indicator?.id || undefined,
            limit: options?.size || 20,
            include_owner_image: '1',
        });
        const response = await fetchJSON<{ next_cursor: string; top_collectors: TopCollector[] }>(path);
        return createPageable(
            response.top_collectors,
            indicator,
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
        );
    }

    async getPoapEvent(eventId: number, options: Omit<BaseHubOptions<number>, 'chainId'> = {}) {
        const indicator = options.indicator;
        const path = urlcat(SIMPLE_HASH_URL, '/api/v0/nfts/poap_event/:event_id', {
            cursor: indicator?.id || undefined,
            limit: options.size || 20,
            event_id: eventId,
            count: 1,
        });
        const response = await fetchJSON<{ next_cursor: string; nfts: NftPreview[]; count?: number }>(path);
        return createPageable(
            response.nfts,
            indicator,
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
            response.count,
        );
    }
}

export const SimpleHashProvider = new SimpleHash();
