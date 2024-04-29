import { createIndicator, createPageable, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { ProfileTabType, ScrollListKey, SocialPlatform } from '@/constants/enum.js';
import { getPostsSelector } from '@/helpers/getPostsSelector.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';

interface LikedFeedListProps {
    profileId: string;
    source: SocialPlatform;
}

export function LikedFeedList({ profileId, source }: LikedFeedListProps) {
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'liked-posts-of', profileId],

        queryFn: async ({ pageParam }) => {
            if (!profileId || source !== SocialPlatform.Farcaster) return createPageable(EMPTY_LIST, undefined);

            const posts = await FarcasterSocialMediaProvider.getLikedPostsByProfileId(
                profileId,
                createIndicator(undefined, pageParam),
            );

            return posts;
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
        select: getPostsSelector(source),
    });

    return (
        <ListInPage
            key={source}
            queryResult={queryResult}
            VirtualListProps={{
                listKey: `${ScrollListKey.Profile}:${ProfileTabType.Liked}:${profileId}`,
                computeItemKey: (index, post) => `${post.postId}-${index}`,
                itemContent: (index, post) => getPostItemContent(index, post),
            }}
            NoResultsFallbackProps={{
                className: 'mt-20',
            }}
        />
    );
}
