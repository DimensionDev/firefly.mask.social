'use client';

import { t, Trans } from '@lingui/macro';
import { createIndicator, EMPTY_LIST } from '@masknet/shared-base';
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import BlackHoleIcon from '@/assets/black-hole.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { VirtualList } from '@/components/VirtualList/index.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';
import { ScrollListKey, SocialPlatform } from '@/constants/enum.js';
import { SORTED_SOURCES } from '@/constants/index.js';
import { mergeThreadPosts } from '@/helpers/mergeThreadPosts.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

export default function Following() {
    const queryClient = useQueryClient();
    const setScrollIndex = useGlobalState.use.setScrollIndex();
    const currentSource = useGlobalState.use.currentSource();
    const isLogin = useIsLogin(currentSource);

    const currentProfileAll = useCurrentProfileAll();

    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
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
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
        select: (data) => {
            const result = data?.pages.flatMap((x) => x?.data || []) || EMPTY_LIST;
            return mergeThreadPosts(currentSource, result);
        },
    });

    const onEndReached = useCallback(async () => {
        if (!hasNextPage || isFetching || isFetchingNextPage) {
            return;
        }

        await fetchNextPage();
    }, [hasNextPage, isFetching, isFetchingNextPage, fetchNextPage]);

    useNavigatorTitle(t`Following`);

    if (!isLogin) {
        return <NotLoginFallback source={currentSource} />;
    }

    if (data.length === 0) {
        return (
            <NoResultsFallback
                className="pt-[228px]"
                icon={<BlackHoleIcon width={200} height="auto" className="text-secondaryMain" />}
                message={
                    <div className="mt-10">
                        <Trans>Follow more friends to continue exploring on {resolveSourceName(currentSource)}.</Trans>
                    </div>
                }
            />
        );
    }

    return (
        <div>
            <VirtualList
                listKey={ScrollListKey.Following}
                computeItemKey={(index, post) => `${post.postId}-${index}`}
                data={data}
                endReached={onEndReached}
                itemContent={(index, post) =>
                    getPostItemContent(index, post, { onClick: () => setScrollIndex(ScrollListKey.Following, index) })
                }
                useWindowScroll
                context={{ hasNextPage }}
                components={{
                    Footer: VirtualListFooter,
                }}
            />
        </div>
    );
}
