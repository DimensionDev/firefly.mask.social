'use client';

import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { createIndicator, createPageable } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useInView } from 'react-cool-inview';
import { useAccount } from 'wagmi';

import BlackHoleIcon from '@/assets/BlackHole.svg';
import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/index.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

export default function Home() {
    const currentSource = useGlobalState.use.currentSource();
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: ['discover', currentSource],
        networkMode: 'always',

        queryFn: async ({ pageParam }) => {
            switch (currentSource) {
                case SocialPlatform.Lens:
                    const result = await LensSocialMediaProvider.discoverPosts(createIndicator(undefined, pageParam));
                    const ids = result.data.flatMap((x) => [x.postId]);
                    fetchAndStoreViews(ids);

                    return result;
                case SocialPlatform.Farcaster:
                    return FarcasterSocialMediaProvider.discoverPosts(createIndicator(undefined, pageParam));
                default:
                    safeUnreachable(currentSource);
                    return createPageable(EMPTY_LIST, undefined);
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
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

    const posts = useMemo(() => data?.pages.flatMap((x) => x.data) || EMPTY_LIST, [data?.pages]);

    const account = useAccount();
    const clearFarcasterCurrentProfile = useFarcasterStateStore.use.clearCurrentProfile();

    return (
        <div>
            {posts.length ? (
                posts.map((x) => <SinglePost post={x} key={x.postId} showMore />)
            ) : (
                <NoResultsFallback
                    className="pt-[228px]"
                    icon={<BlackHoleIcon width={200} height="auto" className="text-secondaryMain" />}
                    message={
                        <div className="mt-10">
                            <Trans>There is no data available for display</Trans>
                        </div>
                    }
                />
            )}
            {hasNextPage && posts.length ? (
                <div className="flex items-center justify-center p-2" ref={observe}>
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                </div>
            ) : null}
        </div>
    );
}
