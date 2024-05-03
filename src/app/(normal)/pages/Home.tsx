'use client';

import { t } from '@lingui/macro';
import { createIndicator, createPageable, type Pageable, type PageIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { getArticleItemContent } from '@/components/VirtualList/getArticleItemContent.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { ScrollListKey, SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { getPostsSelector } from '@/helpers/getPostsSelector.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

async function discoverPosts(source: SocialPlatform, indicator: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
    const provider = resolveSocialMediaProvider(source);
    return provider.discoverPosts(indicator);
}

interface Props {
    // the source of the posts
    source: SocialPlatform;
}

export function HomePage({ source }: Props) {
    const currentSource = useGlobalState.use.currentSource();

    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['posts', currentSource, 'discover'],
        networkMode: 'always',

        queryFn: async ({ pageParam }) => {
            if (source === SocialPlatform.Article) return createPageable(EMPTY_LIST, undefined);
            const posts = await discoverPosts(currentSource, createIndicator(undefined, pageParam));
            if (currentSource === SocialPlatform.Lens) fetchAndStoreViews(posts.data.flatMap((x) => [x.postId]));
            return posts;
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: getPostsSelector(currentSource),
    });

    const articleQueryResult = useSuspenseInfiniteQuery({
        queryKey: ['articles', 'discover'],
        networkMode: 'always',
        queryFn: async ({ pageParam }) => {
            if (currentSource !== SocialPlatform.Article) return createPageable(EMPTY_LIST, undefined);
            return FireflySocialMediaProvider.discoverArticles(createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => data.pages.flatMap((x) => x.data || EMPTY_LIST),
    });

    useNavigatorTitle(t`Discover`);

    if (source === SocialPlatform.Article) {
        return (
            <ListInPage
                key={source}
                queryResult={articleQueryResult}
                VirtualListProps={{
                    listKey: `${ScrollListKey.Discover}:${source}`,
                    computeItemKey: (index, article) => `${article.id}-${index}`,
                    itemContent: (index, article) =>
                        getArticleItemContent(index, article, `${ScrollListKey.Discover}:${source}`),
                }}
                NoResultsFallbackProps={{
                    className: 'pt-[228px]',
                }}
            />
        );
    }

    return (
        <ListInPage
            key={source}
            queryResult={queryResult}
            VirtualListProps={{
                listKey: `${ScrollListKey.Discover}:${source}`,
                computeItemKey: (index, post) => `${post.postId}-${index}`,
                itemContent: (index, post) => getPostItemContent(index, post, `${ScrollListKey.Discover}:${source}`),
            }}
            NoResultsFallbackProps={{
                className: 'pt-[228px]',
            }}
        />
    );
}
