'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useInView } from 'react-cool-inview';

import LoadingIcon from '@/assets/loading.svg';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { createIndicator, createPageable } from '@/maskbook/packages/shared-base/src/index.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

export default function Home() {
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useInfiniteQuery({
        queryKey: ['discover', currentSocialPlatform],
        suspense: true,
        queryFn: async ({ pageParam }) => {
            switch (currentSocialPlatform) {
                case SocialPlatform.Lens:
                    const result = await LensSocialMediaProvider.discoverPosts(createIndicator(undefined, pageParam));
                    const ids = result.data.flatMap((x) => [x.postId]);
                    await fetchAndStoreViews(ids);

                    return result;
                case SocialPlatform.Farcaster:
                    return FireflySocialMediaProvider.discoverPosts(createIndicator(undefined, pageParam));
                default:
                    return createPageable([], undefined);
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

    const results = useMemo(() => data.pages.flatMap((x) => x.data), [data.pages]);

    return (
        <div>
            {results.map((x) => (
                <SinglePost post={x} key={x.postId} showMore />
            ))}
            {hasNextPage && results.length ? (
                <div className="flex items-center justify-center p-2" ref={observe}>
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                </div>
            ) : null}
        </div>
    );
}
