'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo } from 'react';

import { ListInPage } from '@/components/ListInPage.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { ScrollListKey, type SocialSource, Source } from '@/constants/enum.js';
import { getPostsSelector } from '@/helpers/getPostsSelector.js';
import { createIndicator, type Pageable, type PageIndicator } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

async function discoverPosts(source: SocialSource, indicator: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
    const provider = resolveSocialMediaProvider(source);
    return provider.discoverPosts(indicator);
}

export const DiscoverPostList = memo<{ source: SocialSource }>(function DiscoverPostList({ source }) {
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'discover'],
        networkMode: 'always',

        queryFn: async ({ pageParam }) => {
            const posts = await discoverPosts(source, createIndicator(undefined, pageParam));
            if (source === Source.Lens) fetchAndStoreViews(posts.data.flatMap((x) => [x.postId]));
            return posts;
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: getPostsSelector(source),
    });

    return (
        <ListInPage
            source={source}
            key={source}
            queryResult={queryResult}
            VirtualListProps={{
                listKey: `${ScrollListKey.Discover}:${source}`,
                computeItemKey: (index, post) => `${post.postId}-${index}`,
                itemContent: (index, post) => getPostItemContent(index, post, `${ScrollListKey.Discover}:${source}`),
            }}
            NoResultsFallbackProps={{
                className: 'md:pt-[228px] max-md:py-20',
            }}
        />
    );
});
