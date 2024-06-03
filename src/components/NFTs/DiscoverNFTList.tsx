import { createIndicator, createPageable, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { getSingleNFTFeedItemContent } from '@/components/NFTs/VirtualListHelper.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { NFTFeed } from '@/providers/types/NFTs.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

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

    return (
        <ListInPage
            key={currentSource}
            queryResult={nftQueryResult} // TODO: filter spam nft collection by a spam collection store
            VirtualListProps={{
                listKey: `${ScrollListKey.Discover}:${Source.NFTs}`,
                computeItemKey: (index, nftFeed) => `${nftFeed.id}-${index}`,
                itemContent: (index, nftFeed) =>
                    getSingleNFTFeedItemContent(index, nftFeed, {
                        listKey: `${ScrollListKey.Discover}:${Source.NFTs}`,
                    }),
            }}
            NoResultsFallbackProps={{
                className: 'pt-[228px]',
            }}
        />
    );
}
