'use client';

import { t, Trans } from '@lingui/macro';
import { createIndicator, createPageable } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { getArticleItemContent } from '@/components/VirtualList/getArticleItemContent.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { ScrollListKey, SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST, SORTED_SOURCES } from '@/constants/index.js';
import { getPostsSelector } from '@/helpers/getPostsSelector.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

export default function Following() {
    const currentSource = useGlobalState.use.currentSource();
    const isLogin = useIsLogin(currentSource);

    const currentProfileAll = useCurrentProfileAll();
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: [
            'posts',
            currentSource,
            'following',
            isLogin,
            SORTED_SOURCES.map((x) => currentProfileAll[x]?.profileId),
        ],
        queryFn: async ({ pageParam }) => {
            if (!isLogin) return;

            const currentProfile = currentProfileAll[currentSource];
            if (!currentProfile?.profileId) return;

            const provider = resolveSocialMediaProvider(currentSource);
            if (!provider) return;

            const posts = await provider.discoverPostsById(
                currentProfile.profileId,
                createIndicator(undefined, pageParam),
            );

            if (currentSource === SocialPlatform.Lens) {
                const ids = posts.data.flatMap((x) => [x.postId]);
                fetchAndStoreViews(ids);
            }

            return posts;
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => {
            if (lastPage?.data.length === 0) return undefined;
            return lastPage?.nextIndicator?.id;
        },
        select: getPostsSelector(currentSource),
    });

    const articleQueryResult = useSuspenseInfiniteQuery({
        queryKey: ['articles', 'following', currentSource],
        networkMode: 'always',
        queryFn: async ({ pageParam }) => {
            if (currentSource !== SocialPlatform.Article) return createPageable(EMPTY_LIST, undefined);
            return FireflySocialMediaProvider.getFollowingArtiles(createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => data.pages.flatMap((x) => x.data || EMPTY_LIST),
    });

    useNavigatorTitle(t`Following`);

    if (currentSource === SocialPlatform.Article) {
        return (
            <ListInPage
                key={currentSource}
                queryResult={articleQueryResult}
                VirtualListProps={{
                    listKey: `${ScrollListKey.Following}:${currentSource}`,
                    computeItemKey: (index, article) => `${article.id}-${index}`,
                    itemContent: (index, article) =>
                        getArticleItemContent(index, article, `${ScrollListKey.Following}:${currentSource}`),
                }}
                NoResultsFallbackProps={{
                    className: 'pt-[228px]',
                }}
            />
        );
    }

    return (
        <ListInPage
            key={currentSource}
            queryResult={queryResult}
            loginRequired
            VirtualListProps={{
                listKey: `${ScrollListKey.Following}:${currentSource}`,
                computeItemKey: (index, post) => `${post.postId}-${index}`,
                itemContent: (index, post) =>
                    getPostItemContent(index, post, `${ScrollListKey.Following}:${currentSource}`),
            }}
            NoResultsFallbackProps={{
                className: 'pt-[228px]',
                message: (
                    <div className="mt-10">
                        <Trans>Follow more friends to continue exploring on {resolveSourceName(currentSource)}.</Trans>
                    </div>
                ),
            }}
        />
    );
}
