'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo } from 'react';

import { ListInPage } from '@/components/ListInPage.js';
import { getArticleItemContent } from '@/components/VirtualList/getArticleItemContent.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { createIndicator } from '@/helpers/pageable.js';
import { FireflyArticleProvider } from '@/providers/firefly/Article.js';

export const DiscoverArticleList = memo(function DiscoverArticleList() {
    const articleQueryResult = useSuspenseInfiniteQuery({
        queryKey: ['articles', 'discover'],
        networkMode: 'always',
        queryFn: async ({ pageParam }) => {
            return FireflyArticleProvider.discoverArticles(createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => data.pages.flatMap((x) => x.data),
    });

    return (
        <ListInPage
            queryResult={articleQueryResult}
            VirtualListProps={{
                listKey: `${ScrollListKey.Discover}:${Source.Article}`,
                computeItemKey: (index, article) => `${article.id}-${index}`,
                itemContent: (index, article) =>
                    getArticleItemContent(index, article, `${ScrollListKey.Discover}:${Source.Article}`),
            }}
            NoResultsFallbackProps={{
                className: 'pt-[228px]',
            }}
        />
    );
});
