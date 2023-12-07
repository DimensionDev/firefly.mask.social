'use client';

import { createIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { useLogin } from '@/hooks/useLogin.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

export default function Following() {
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();
    const isLogin = useLogin(currentSocialPlatform);
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();

    const { data } = useSuspenseInfiniteQuery({
        queryKey: [
            'following',
            currentSocialPlatform,
            isLogin,
            currentLensProfile?.profileId,
            currentFarcasterProfile?.profileId,
        ],
        queryFn: async ({ pageParam }) => {
            if (!isLogin) return;
            switch (currentSocialPlatform) {
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
                    return;
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
    });

    const results = useMemo(() => data.pages?.flatMap((x) => x?.data ?? []) ?? [], [data]);

    if (!isLogin) {
        return <NotLoginFallback platform={currentSocialPlatform} />;
    }

    return (
        <div>
            {results.length ? (
                results.map((x) => <SinglePost post={x} key={x.postId} showMore />)
            ) : (
                <NoResultsFallback />
            )}
        </div>
    );
}
