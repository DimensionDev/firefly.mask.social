'use client';

import { t, Trans } from '@lingui/macro';
import { createIndicator, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import BlackHoleIcon from '@/assets/black-hole.svg';
import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { VirtualList } from '@/components/VirtualList.js';
import { ScrollListKey, SocialPlatform } from '@/constants/enum.js';
import { SORTED_SOURCES } from '@/constants/index.js';
import { mergeThreadPosts } from '@/helpers/mergeThreadPosts.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

export default function Following() {
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

    const itemContent = useCallback(
        (index: number, post: Post) => {
            return (
                <SinglePost
                    post={post}
                    key={`${post.postId}-${index}`}
                    showMore
                    onClick={() => {
                        setScrollIndex(ScrollListKey.Following, index);
                    }}
                />
            );
        },
        [setScrollIndex],
    );

    const Footer = useCallback(() => {
        if (!hasNextPage) return null;
        return (
            <div className="flex items-center justify-center p-2">
                <LoadingIcon width={16} height={16} className="animate-spin" />
            </div>
        );
    }, [hasNextPage]);

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
                itemContent={itemContent}
                useWindowScroll
                components={{
                    Footer,
                }}
            />
        </div>
    );
}
