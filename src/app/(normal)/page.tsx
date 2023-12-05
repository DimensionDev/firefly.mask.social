'use client';

import { Trans } from '@lingui/macro';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useInView } from 'react-cool-inview';

import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import Image from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { createIndicator, createPageable } from '@/maskbook/packages/shared-base/src/index.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

export default function Home() {
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isError, isPending, refetch, isFetching } =
        useSuspenseInfiniteQuery({
            queryKey: ['discover', currentSocialPlatform],

            queryFn: async ({ pageParam }) => {
                switch (currentSocialPlatform) {
                    case SocialPlatform.Lens:
                        const result = await LensSocialMediaProvider.discoverPosts(
                            createIndicator(undefined, pageParam),
                        );
                        const ids = result.data.flatMap((x) => [x.postId]);
                        await fetchAndStoreViews(ids);

                        return result;
                    case SocialPlatform.Farcaster:
                        return WarpcastSocialMediaProvider.discoverPosts(createIndicator(undefined, pageParam));
                    default:
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

    const results = useMemo(() => data.pages.flatMap((x) => x.data), [data.pages]);

    if (isError && !results.length && !isPending) {
        return (
            <div className="flex h-screen flex-col items-center justify-center">
                <Image src="/image/radar.png" width={200} height={106} alt="Something went wrong, Please try again." />
                <div className="mt-11 text-sm font-bold">
                    <Trans>Something went wrong, Please try again.</Trans>
                </div>
                <button
                    className="mt-6 whitespace-nowrap rounded-2xl bg-main px-4 py-1 text-sm font-semibold leading-6 text-primaryBottom"
                    onClick={refetch}
                >
                    <LoadingIcon
                        width={16}
                        height={16}
                        className={classNames('mr-2 inline-block', isFetching ? 'animate-spin' : '')}
                    />
                    <Trans>Refresh</Trans>
                </button>
            </div>
        );
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
