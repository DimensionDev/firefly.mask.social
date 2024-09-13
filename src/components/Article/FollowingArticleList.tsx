'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo } from 'react';

import { ListInPage } from '@/components/ListInPage.js';
import { getArticleItemContent } from '@/components/VirtualList/getArticleItemContent.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { EMPTY_LIST, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { createIndicator, createPageable } from '@/helpers/pageable.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { FireflyArticleProvider } from '@/providers/firefly/Article.js';
import type { Article } from '@/providers/types/Article.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export const FollowingArticleList = memo(function FollowingArticleList() {
    const currentSource = useGlobalState.use.currentSource();
    const currentProfileAll = useCurrentProfileAll();

    const articleQueryResult = useSuspenseInfiniteQuery({
        queryKey: [
            'articles',
            'following',
            currentSource,
            SORTED_SOCIAL_SOURCES.map((x) => currentProfileAll[x]?.profileId),
        ],
        networkMode: 'always',
        queryFn: async ({ pageParam }) => {
            if (currentSource !== Source.Article) return createPageable<Article>(EMPTY_LIST, createIndicator());
            return FireflyArticleProvider.getFollowingArticles(createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => data.pages.flatMap((x) => x.data),
    });

    return (
        <ListInPage
            key={currentSource}
            queryResult={articleQueryResult}
            VirtualListProps={{
                listKey: `${ScrollListKey.Following}:${Source.Article}`,
                computeItemKey: (index, article) => `${article.id}-${index}`,
                itemContent: (index, article) =>
                    getArticleItemContent(index, article, `${ScrollListKey.Following}:${Source.Article}`),
            }}
            NoResultsFallbackProps={{
                className: 'md:pt-[228px] max-md:py-20',
            }}
        />
    );
});
