import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { getArticleItemContent } from '@/components/VirtualList/getArticleItemContent.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { createIndicator } from '@/helpers/pageable.js';
import { FireflyArticleProvider } from '@/providers/firefly/Article.js';

interface ArticleListProps {
    address: string;
}

export function ArticleList({ address }: ArticleListProps) {
    const articleQueryResult = useSuspenseInfiniteQuery({
        queryKey: ['articles', 'profile', address],
        queryFn: async ({ pageParam }) => {
            return FireflyArticleProvider.discoverArticlesByAddress(address, createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => data.pages.flatMap((x) => x.data),
    });

    return (
        <ListInPage
            key={address}
            queryResult={articleQueryResult}
            VirtualListProps={{
                listKey: `${ScrollListKey.Profile}:${Source.Article}:${address}`,
                computeItemKey: (index, article) => `${article.id}-${index}`,
                itemContent: (index, article) =>
                    getArticleItemContent(index, article, `${ScrollListKey.Profile}:${Source.Article}:${address}`),
            }}
            NoResultsFallbackProps={{
                className: 'md:pt-[228px] max-md:py-20',
            }}
        />
    );
}
