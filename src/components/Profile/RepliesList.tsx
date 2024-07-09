import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { ProfileTabType, ScrollListKey, type SocialSource, Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { getPostsSelector } from '@/helpers/getPostsSelector.js';
import { createIndicator, createPageable } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface RepliesListProps {
    profileId: string;
    source: SocialSource;
}

export function RepliesList({ profileId, source }: RepliesListProps) {
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'replies-of', profileId],

        queryFn: async ({ pageParam }) => {
            if (!profileId) return createPageable<Post>(EMPTY_LIST, createIndicator());

            const provider = resolveSocialMediaProvider(source);
            const posts = await provider.getRepliesPostsByProfileId(profileId, createIndicator(undefined, pageParam));

            if (source === Source.Lens) {
                const ids = posts.data.flatMap((x) => [x.postId]);
                await fetchAndStoreViews(ids);
            }
            return posts;
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => {
            if (!lastPage?.data.length) return;
            return lastPage.nextIndicator?.id;
        },
        select: getPostsSelector(source),
    });

    return (
        <ListInPage
            key={source}
            queryResult={queryResult}
            VirtualListProps={{
                listKey: `${ScrollListKey.Profile}:${ProfileTabType.Replies}:${profileId}`,
                computeItemKey: (index, post) => `${post.postId}-${index}`,
                itemContent: (index, post) => getPostItemContent(index, post),
            }}
            NoResultsFallbackProps={{
                className: 'mt-20',
            }}
        />
    );
}
