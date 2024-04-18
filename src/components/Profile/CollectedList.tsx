import { createIndicator, createPageable } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { VirtualList } from '@/components/VirtualList/VirtualList.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';
import { ScrollListKey, SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { mergeThreadPosts } from '@/helpers/mergeThreadPosts.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface CollectedListProps {
    profileId: string;
    source: SocialPlatform;
}

export function CollectedList({ profileId, source }: CollectedListProps) {
    const setScrollIndex = useGlobalState.use.setScrollIndex();
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'bookmarks', profileId],
        queryFn: async ({ pageParam }) => {
            if (!profileId) return createPageable(EMPTY_LIST, undefined);

            const provider = resolveSocialMediaProvider(source);
            if (!provider) return createPageable(EMPTY_LIST, undefined);

            const posts = await provider.getCollectedPostsByProfileId(profileId, createIndicator(undefined, pageParam));

            if (source === SocialPlatform.Lens) {
                const ids = posts.data.flatMap((x) => [x.postId]);
                await fetchAndStoreViews(ids);
            }

            return posts;
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => {
            const result = data.pages.flatMap((x) => x.data) || EMPTY_LIST;
            return mergeThreadPosts(source, result);
        },
    });

    const onEndReached = useCallback(async () => {
        if (!hasNextPage || isFetching || isFetchingNextPage) {
            return;
        }

        await fetchNextPage();
    }, [hasNextPage, isFetching, isFetchingNextPage, fetchNextPage]);

    if (!data.length) {
        return <NoResultsFallback className="mt-20" />;
    }

    return (
        <VirtualList
            listKey={`${ScrollListKey.Collected}:${profileId}`}
            computeItemKey={(index, post) => `${post.postId}-${index}`}
            data={data}
            endReached={onEndReached}
            itemContent={(index, post) =>
                getPostItemContent(index, post, {
                    onClick: () => {
                        setScrollIndex(`${ScrollListKey.Collected}_${profileId}`, index);
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
