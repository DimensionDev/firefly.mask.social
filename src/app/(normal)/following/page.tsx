'use client';

import { safeUnreachable } from '@masknet/kit';
import { createIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useInView } from 'react-cool-inview';

import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

export default function Following() {
    const currentSource = useGlobalState.use.currentSource();
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();

    const isLogin = useIsLogin(currentSource);

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: [
            'following',
            currentSource,
            isLogin,
            currentLensProfile?.profileId,
            currentFarcasterProfile?.profileId,
        ],
        queryFn: async ({ pageParam }) => {
            if (!isLogin) return;
            switch (currentSource) {
                case SocialPlatform.Lens:
                    if (!currentLensProfile?.profileId) return;
                    return LensSocialMediaProvider.discoverPostsById(
                        currentLensProfile.profileId,
                        createIndicator(undefined, pageParam),
                    );
                case SocialPlatform.Farcaster:
                    if (!currentFarcasterProfile?.profileId) return;
                    return WarpcastSocialMediaProvider.discoverPostsById(
                        currentFarcasterProfile.profileId,
                        createIndicator(undefined, pageParam),
                    );
                default:
                    safeUnreachable(currentSource);
                    return;
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
    });

    const { observe } = useInView({
        rootMargin: '300px 0px',
        onChange: async ({ inView }) => {
            if (!inView || !hasNextPage || isFetching || isFetchingNextPage) {
                return;
            }
            await fetchNextPage();
        },
    });

    const results = useMemo(() => data.pages?.flatMap((x) => x?.data ?? []) ?? [], [data]);

    if (!isLogin) {
        return <NotLoginFallback source={currentSource} />;
    }

    return (
        <div>
            {results.length ? (
                results.map((x) => <SinglePost post={x} key={x.postId} showMore />)
            ) : (
                <NoResultsFallback />
            )}
            {hasNextPage && results.length ? (
                <div className="flex items-center justify-center p-2" ref={observe}>
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                </div>
            ) : null}
        </div>
    );
}
