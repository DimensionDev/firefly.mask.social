import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { createIndicator, createPageable, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-cool-inview';

import BlackHoleIcon from '@/assets/black-hole.svg';
import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { getFarcasterThreadsAndPosts } from '@/helpers/getFarcasterThreadsAndPosts.js';
import { getLensThreadsAndPosts } from '@/helpers/getLensThreadsAndPosts.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface ContentFeedProps {
    profileId: string;
    source: SocialPlatform;
}
export function ContentFeed({ profileId, source }: ContentFeedProps) {
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: ['getPostsByProfileId', source, profileId],

        queryFn: async ({ pageParam }) => {
            if (!profileId) return createPageable(EMPTY_LIST, undefined);

            switch (source) {
                case SocialPlatform.Lens:
                    const result = await LensSocialMediaProvider.getPostsByProfileId(
                        profileId,
                        createIndicator(undefined, pageParam),
                    );
                    const ids = result.data.flatMap((x) => [x.postId]);
                    await fetchAndStoreViews(ids);

                    return result;
                case SocialPlatform.Farcaster:
                    return FarcasterSocialMediaProvider.getPostsByProfileId(
                        profileId,
                        createIndicator(undefined, pageParam),
                    );
                default:
                    safeUnreachable(source);
                    return createPageable(EMPTY_LIST, undefined);
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => {
            const result = data.pages.flatMap((x) => x.data) || EMPTY_LIST;
            switch (source) {
                case SocialPlatform.Lens:
                    return getLensThreadsAndPosts(result);
                case SocialPlatform.Farcaster:
                    return getFarcasterThreadsAndPosts(result);
                default:
                    safeUnreachable(source);
                    return result;
            }
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

    if (!data.length)
        return (
            <NoResultsFallback
                className="mt-20"
                icon={<BlackHoleIcon width={200} height="auto" className="text-secondaryMain" />}
                message={
                    <div className="mt-10">
                        <Trans>There is no data available for display.</Trans>
                    </div>
                }
            />
        );

    return (
        <div key={source}>
            {data.map((x) => (
                <SinglePost post={x} key={x.postId} showMore />
            ))}
            {hasNextPage && data.length ? (
                <div className="flex items-center justify-center p-2" ref={observe}>
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                </div>
            ) : (
                <div className="flex items-center justify-center p-6 text-base text-secondary">
                    <Trans>You&apos;ve hit rock bottom.</Trans>
                </div>
            )}
        </div>
    );
}
