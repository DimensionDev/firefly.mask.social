import { createIndicator, createPageable, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { ProfileTabType, ScrollListKey, type SocialSource } from '@/constants/enum.js';
import { getPostsSelector } from '@/helpers/getPostsSelector.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';

interface LikedFeedListProps {
    profileId: string;
    source: SocialSource;
}

export function LikedFeedList({ profileId, source }: LikedFeedListProps) {
    const query = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'liked-posts-of', profileId],

        queryFn: async ({ pageParam }) => {
            if (!profileId) return createPageable(EMPTY_LIST, undefined);
            const provider = resolveSocialMediaProvider(source);
            if (!provider) return createPageable(EMPTY_LIST, undefined);

            const posts = await provider.getLikedPostsByProfileId(profileId, createIndicator(undefined, pageParam));

            return posts;
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => {
            if (lastPage?.data.length === 0) return undefined;
            return lastPage?.nextIndicator?.id;
        },
        select: getPostsSelector(source),
    });

    return (
        <ListInPage
            key={source}
            queryResult={query}
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
