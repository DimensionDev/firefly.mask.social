'use client';
import { createIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { getArticleItemContent } from '@/components/VirtualList/getArticleItemContent.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { FireflyArticleProvider } from '@/providers/firefly/Article.js';

export function ArticleBookmarkList() {
    const query = useSuspenseInfiniteQuery({
        queryKey: ['posts', Source.Article, 'bookmark'],
        queryFn: async ({ pageParam }) => {
            try {
                const result = await FireflyArticleProvider.getBookmarks(createIndicator(undefined, pageParam));
                return result;
            } catch (error) {
                enqueueErrorMessage('Failed to fetch bookmarks', { error });
                throw error;
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => {
            if (lastPage?.data.length === 0) return undefined;
            return lastPage?.nextIndicator?.id;
        },
        select: (data) => data.pages.flatMap((x) => x.data || []),
    });

    return (
        <ListInPage
            loginRequired
            key="article"
            queryResult={query}
            VirtualListProps={{
                listKey: `${ScrollListKey.Bookmark}:article`,
                computeItemKey: (index, article) => `${article.id}-${article.hash}-${index}`,
                itemContent: (index, article) =>
                    getArticleItemContent(index, article, `${ScrollListKey.Bookmark}:article`),
            }}
            NoResultsFallbackProps={{
                className: 'mt-20',
            }}
        />
    );
}
