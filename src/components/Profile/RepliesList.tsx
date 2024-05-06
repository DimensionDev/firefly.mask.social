import { createIndicator, createPageable, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { ProfileTabType, ScrollListKey, SocialPlatform } from '@/constants/enum.js';
import { getPostsSelector } from '@/helpers/getPostsSelector.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface RepliesListProps {
    profileId: string;
    source: SocialPlatform;
}

export function RepliesList({ profileId, source }: RepliesListProps) {
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'replies-of', profileId],

        queryFn: async ({ pageParam }) => {
            if (!profileId) return createPageable(EMPTY_LIST, undefined);

            const provider = resolveSocialMediaProvider(source);
            if (!provider) return createPageable(EMPTY_LIST, undefined);

            const posts = await provider.getRepliesPostsByProfileId(profileId, createIndicator(undefined, pageParam));

            if (source === SocialPlatform.Lens) {
                const ids = posts.data.flatMap((x) => [x.postId]);
                await fetchAndStoreViews(ids);
            }
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
