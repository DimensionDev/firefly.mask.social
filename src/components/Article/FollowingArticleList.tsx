'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo } from 'react';

import { ListInPage } from '@/components/ListInPage.js';
import { getArticleItemContent } from '@/components/VirtualList/getArticleItemContent.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { createIndicator } from '@/helpers/pageable.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { FireflyArticleProvider } from '@/providers/firefly/Article.js';

export const FollowingArticleList = memo(function FollowingArticleList() {
    const currentProfileAll = useCurrentProfileAll();

    const articleQueryResult = useSuspenseInfiniteQuery({
        queryKey: [
            'articles',
            'following',
            Source.Article,
            SORTED_SOCIAL_SOURCES.map((x) => currentProfileAll[x]?.profileId),
        ],
        networkMode: 'always',
        queryFn: async ({ pageParam }) => {
            return FireflyArticleProvider.getFollowingArticles(createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => data.pages.flatMap((x) => x.data),
    });

    return (
        <ListInPage
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
