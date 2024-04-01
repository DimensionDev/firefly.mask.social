'use client';

import { t, Trans } from '@lingui/macro';
import { createIndicator, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-cool-inview';

import BlackHoleIcon from '@/assets/black-hole.svg';
import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
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
    const currentSource = useGlobalState.use.currentSource();
    const isLogin = useIsLogin(currentSource);

    const currentProfileAll = useCurrentProfileAll();

    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: [
            'following',
            currentSource,
            isLogin,
            SORTED_SOURCES.map((x) => currentProfileAll[x]?.profileId).join('_'),
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
