'use client';

import { t } from '@lingui/macro';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';

import { ListInPage } from '@/components/ListInPage.js';
import { getArticleItemContent } from '@/components/VirtualList/getArticleItemContent.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { createIndicator } from '@/helpers/pageable.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { FireflyArticleProvider } from '@/providers/firefly/Article.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export function ArticleBookmarkList() {
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);
    const currentProfileAll = useCurrentProfileAll();
    const isLogin = useIsLogin(currentSocialSource);
    const query = useSuspenseInfiniteQuery({
        queryKey: [
            'posts',
            Source.Article,
            'bookmark',
            SORTED_SOCIAL_SOURCES.map((x) => currentProfileAll[x]?.profileId),
        ],
        queryFn: async ({ pageParam }) => {
            if (!isLogin) return;
            try {
                const result = await FireflyArticleProvider.getBookmarks(createIndicator(undefined, pageParam));
                return result;
            } catch (error) {
                enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to fetch bookmarks.`), { error });
                throw error;
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => {
            if (lastPage?.data.length === 0) return;
            return lastPage?.nextIndicator?.id;
        },
        select: (data) => compact(data.pages.flatMap((x) => x?.data)),
    });

    useNavigatorTitle(t`Bookmarks`);

    return (
        <ListInPage
            source={Source.Article}
            loginRequired
            key="article"
            queryResult={query}
            VirtualListProps={{
                listKey: `${ScrollListKey.Bookmark}:${Source.Article}`,
                computeItemKey: (index, article) => `${article.id}-${article.hash}-${index}`,
                itemContent: (index, article) =>
                    getArticleItemContent(index, article, `${ScrollListKey.Bookmark}:${Source.Article}`, {
                        isBookmark: true,
                    }),
            }}
            NoResultsFallbackProps={{
                className: 'mt-20',
            }}
        />
    );
}
