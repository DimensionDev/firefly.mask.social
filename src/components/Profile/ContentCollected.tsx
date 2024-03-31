import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { createIndicator, createPageable } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-cool-inview';

import BlackHoleIcon from '@/assets/black-hole.svg';
import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { getThreadsAndPosts } from '@/services/getThreadsAndPosts.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface ContentFeedProps {
    profileId: string;
    source: SocialPlatform;
}
export function ContentCollected({ profileId, source }: ContentFeedProps) {
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: ['getPostsByBookmarks', source, profileId],
        queryFn: async ({ pageParam }) => {
            if (!profileId) return createPageable(EMPTY_LIST, undefined);

            switch (source) {
                case SocialPlatform.Lens:
                    const posts = await LensSocialMediaProvider.getPostsByCollected(
                        profileId,
                        createIndicator(undefined, pageParam),
                    );
                    const ids = posts.data.flatMap((x) => [x.postId]);
                    await fetchAndStoreViews(ids);

                    return posts;
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
            return getThreadsAndPosts(source, result);
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
        <div>
            {data.map((x) => (
                <SinglePost post={x} key={x.postId} showMore />
            ))}
            {hasNextPage ? (
                <div className="flex items-center justify-center p-2" ref={observe}>
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                </div>
            ) : null}
        </div>
    );
}
