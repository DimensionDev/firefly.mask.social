import { createIndicator, createPageable, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { VirtualList } from '@/components/VirtualList/VirtualList.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';
import { ScrollListKey, SocialPlatform } from '@/constants/enum.js';
import { getPostsSelector } from '@/helpers/getPostsSelector.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface FeedListProps {
    profileId: string;
    source: SocialPlatform;
}

export function FeedList({ profileId, source }: FeedListProps) {
    const setScrollIndex = useGlobalState.use.setScrollIndex();
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'posts-of', profileId],

        queryFn: async ({ pageParam }) => {
            if (!profileId) return createPageable(EMPTY_LIST, undefined);

            const provider = resolveSocialMediaProvider(source);
            if (!provider) return createPageable(EMPTY_LIST, undefined);

            const posts = await provider.getPostsByProfileId(profileId, createIndicator(undefined, pageParam));

            if (source === SocialPlatform.Lens) {
                const ids = posts.data.flatMap((x) => [x.postId]);
                await fetchAndStoreViews(ids);
            }
            return posts;
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
        select: getPostsSelector(source),
    });

    const onEndReached = useCallback(async () => {
        if (!hasNextPage || isFetching || isFetchingNextPage) {
            return;
        }

        await fetchNextPage();
    }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);

    if (!data.length) {
        return <NoResultsFallback className="mt-20" />;
    }

    return (
        <VirtualList
            key={source}
            listKey={`${ScrollListKey.Profile}:${profileId}`}
            computeItemKey={(index, post) => `${post.postId}-${index}`}
            data={data}
            endReached={onEndReached}
            itemContent={(index, post) =>
                getPostItemContent(index, post, {
                    onClick: () => {
                        setScrollIndex(`${ScrollListKey.Profile}_${profileId}`, index);
                    },
                })
            }
            useWindowScroll
            context={{ hasNextPage }}
            components={{
                Footer: VirtualListFooter,
            }}
        />
    );
}
