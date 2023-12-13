import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { createIndicator, createPageable, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useInView } from 'react-cool-inview';

import BlackHoleIcon from '@/assets/BlackHole.svg';
import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface ContentFeedProps {
    profileId: string;
}
export default function ContentFeed({ profileId }: ContentFeedProps) {
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: ['getPostsByProfileId', currentSocialPlatform, profileId],

        queryFn: async ({ pageParam }) => {
            if (!profileId) return createPageable([], undefined);

            switch (currentSocialPlatform) {
                case SocialPlatform.Lens:
                    const result = await LensSocialMediaProvider.getPostsByProfileId(
                        profileId,
                        createIndicator(undefined, pageParam),
                    );
                    const ids = result.data.flatMap((x) => [x.postId]);
                    await fetchAndStoreViews(ids);

                    return result;
                case SocialPlatform.Farcaster:
                    return WarpcastSocialMediaProvider.getPostsByProfileId(
                        profileId,
                        createIndicator(undefined, pageParam),
                    );
                default:
                    safeUnreachable(currentSocialPlatform);
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

    if (!results.length)
        return (
            <NoResultsFallback
                className="mt-20"
                icon={<BlackHoleIcon width={200} height="auto" className="text-secondaryMain" />}
                message={
                    <div className="mt-10">
                        <Trans>There is no data available for display</Trans>
                    </div>
                }
            />
        );

    return (
        <div>
            {results.map((x) => (
                <SinglePost post={x} key={x.postId} showMore />
            ))}
            {hasNextPage && results.length > 0 ? (
                <div className="flex items-center justify-center p-2" ref={observe}>
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                </div>
            ) : null}
        </div>
    );
}
