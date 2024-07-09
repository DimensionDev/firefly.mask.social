'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo } from 'react';

import { ListInPage } from '@/components/ListInPage.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { ScrollListKey, type SocialSource, Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { getPostsSelector } from '@/helpers/getPostsSelector.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { createIndicator, createPageable, type Pageable, type PageIndicator } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

async function discoverPosts(source: SocialSource, indicator: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
    const provider = resolveSocialMediaProvider(source);
    return provider.discoverPosts(indicator);
}

export const DiscoverPostList = memo(function DiscoverPostList() {
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);

    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['posts', currentSource, 'discover'],
        networkMode: 'always',

        queryFn: async ({ pageParam }) => {
            if (currentSource === Source.Article) return createPageable<Post>(EMPTY_LIST, createIndicator());
            const posts = await discoverPosts(currentSocialSource, createIndicator(undefined, pageParam));
            if (currentSource === Source.Lens) fetchAndStoreViews(posts.data.flatMap((x) => [x.postId]));
            return posts;
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: getPostsSelector(currentSocialSource),
    });

    return (
        <ListInPage
            key={currentSource}
            queryResult={queryResult}
            VirtualListProps={{
                listKey: `${ScrollListKey.Discover}:${currentSource}`,
                computeItemKey: (index, post) => `${post.postId}-${index}`,
                itemContent: (index, post) =>
                    getPostItemContent(index, post, `${ScrollListKey.Discover}:${currentSource}`),
            }}
            NoResultsFallbackProps={{
                className: 'pt-[228px]',
            }}
        />
    );
});
