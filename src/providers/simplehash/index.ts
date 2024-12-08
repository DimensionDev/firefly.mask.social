import urlcat from 'urlcat';

import type { NFTMarketplace } from '@/constants/enum.js';
import { EMPTY_LIST, SIMPLE_HASH_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { createIndicator, createNextIndicator, createPageable, type PageIndicator } from '@/helpers/pageable.js';
import type { Collection, NftPreview, NftPreviewCollection } from '@/providers/types/Firefly.js';

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
}

export const SimpleHashProvider = new SimpleHash();
