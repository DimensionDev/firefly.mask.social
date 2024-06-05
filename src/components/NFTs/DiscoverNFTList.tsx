import { createIndicator, createPageable, EMPTY_LIST } from '@masknet/shared-base';
import { ChainId } from '@masknet/web3-shared-evm';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { ListInPage } from '@/components/ListInPage.js';
import { getSingleNFTFeedItemContent } from '@/components/NFTs/VirtualListHelper.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { NFTFeed } from '@/providers/types/NFTs.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useInvalidNFTStore } from '@/store/useInvalidNFTStore.js';

export function DiscoverNFTList() {
    const currentSource = useGlobalState.use.currentSource();

    const nftQueryResult = useSuspenseInfiniteQuery({
        queryKey: ['nft', 'discover', currentSource],
        networkMode: 'always',
        async queryFn({ pageParam }) {
            if (currentSource !== Source.NFTs) return createPageable<NFTFeed>(EMPTY_LIST, createIndicator());
            return await FireflySocialMediaProvider.discoverNFTs({
                indicator: createIndicator(undefined, pageParam),
            });
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => data.pages.flatMap((p) => p.data),
    });

    const useInvalidNFTCount = useInvalidNFTStore((state) => state.size);
    const filteredData = useMemo(() => {
        const invalidNFTStore = useInvalidNFTStore.getState();
        return nftQueryResult.data.filter((feed) => {
            const tokenId = feed.trans.token_list?.[0]?.id ?? '';
            return !invalidNFTStore.has(feed.trans.token_address, tokenId, ChainId.Mainnet);
        });
    }, [nftQueryResult.data, useInvalidNFTCount]);

    return (
        <ListInPage
            key={currentSource}
            queryResult={{ ...nftQueryResult, data: filteredData }}
            VirtualListProps={{
                listKey: `${ScrollListKey.Discover}:${Source.NFTs}`,
                computeItemKey: (index, nftFeed) => `${nftFeed.id}-${index}`,
                itemContent: (index, nftFeed) =>
                    getSingleNFTFeedItemContent(index, nftFeed, {
                        listKey: `${ScrollListKey.Discover}:${Source.NFTs}`,
                    }),
                overscan: 2000,
            }}
            NoResultsFallbackProps={{
                className: 'pt-[228px]',
            }}
        />
    );
}
