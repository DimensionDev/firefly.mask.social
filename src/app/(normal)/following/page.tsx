'use client';

import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { createIndicator, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-cool-inview';

import BlackHoleIcon from '@/assets/black-hole.svg';
import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { mergeTreadPosts } from '@/helpers/mergeTreadPosts.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

export default function Following() {
    const currentSource = useGlobalState.use.currentSource();
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();

    const isLogin = useIsLogin(currentSource);

    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

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
                    const result = await LensSocialMediaProvider.discoverPostsById(
                        currentLensProfile.profileId,
                        createIndicator(undefined, pageParam),
                    );

                    const ids = result.data.flatMap((x) => [x.postId]);

                    fetchAndStoreViews(ids);

                    return result;
                case SocialPlatform.Farcaster:
                    if (!currentFarcasterProfile?.profileId) return;
                    return FarcasterSocialMediaProvider.discoverPostsById(
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
        select: (data) => {
            const result = data?.pages.flatMap((x) => x?.data || []) || EMPTY_LIST;
            return mergeTreadPosts(currentSource, result);
        },
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

    useNavigatorTitle(t`Following`);

    if (!isLogin) {
        return <NotLoginFallback source={currentSource} />;
    }

    return (
        <div>
            {data.length ? (
                data.map((x) => <SinglePost post={x} key={x.postId} showMore />)
            ) : (
                <NoResultsFallback
                    className="pt-[228px]"
                    icon={<BlackHoleIcon width={200} height="auto" className="text-secondaryMain" />}
                    message={
                        <div className="mt-10">
                            <Trans>
                                Follow more friends to continue exploring on {resolveSourceName(currentSource)}.
                            </Trans>
                        </div>
                    }
                />
            )}
            {hasNextPage && data.length ? (
                <div className="flex items-center justify-center p-2" ref={observe}>
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                </div>
            ) : null}
        </div>
    );
}
