'use client';

import { createIndicator, createPageable, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo } from 'react';

import { ListInPage } from '@/components/ListInPage.js';
import { getArticleItemContent } from '@/components/VirtualList/getArticleItemContent.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { FireflyArticleProvider } from '@/providers/firefly/Article.js';
import type { Article } from '@/providers/types/Article.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export const FollowingArticleList = memo(function FollowingArticleList() {
    const currentSource = useGlobalState.use.currentSource();

    const articleQueryResult = useSuspenseInfiniteQuery({
        queryKey: ['articles', 'following', currentSource],
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
                className: 'pt-[228px]',
            }}
        />
    );
});
