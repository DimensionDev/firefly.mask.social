import { Trans } from '@lingui/macro';
import { createIndicator, createPageable, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import BlackHoleIcon from '@/assets/black-hole.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { VirtualList } from '@/components/VirtualList/VirtualList.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';
import { ScrollListKey, SocialPlatform } from '@/constants/enum.js';
import { mergeThreadPosts } from '@/helpers/mergeThreadPosts.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface PostListProps {
    channelId: string;
    source: SocialPlatform;
}
export function PostList({ channelId, source }: PostListProps) {
    const setScrollIndex = useGlobalState.use.setScrollIndex();
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'posts-of', channelId],

        queryFn: async ({ pageParam }) => {
            if (!channelId) return createPageable(EMPTY_LIST, undefined);

            const provider = resolveSocialMediaProvider(source);
            if (!provider) return createPageable(EMPTY_LIST, undefined);

            const posts = await provider.getPostsByChannelId(channelId, createIndicator(undefined, pageParam));

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
    }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);

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
            <VirtualList
                listKey={ScrollListKey.Channel}
                computeItemKey={(index, post) => `${post.postId}-${index}`}
                data={data}
                endReached={onEndReached}
                itemContent={(index, post) =>
                    getPostItemContent(index, post, {
                        onClick: () => {
                            setScrollIndex(`${ScrollListKey.Channel}_${channelId}`, index);
                        },
                    })
                }
                useWindowScroll
                context={{ hasNextPage }}
                components={{
                    Footer: VirtualListFooter,
                }}
            />
        </div>
    );
}
