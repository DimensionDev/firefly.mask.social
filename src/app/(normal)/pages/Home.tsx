'use client';

import { t, Trans } from '@lingui/macro';
import { createIndicator, type Pageable, type PageIndicator } from '@masknet/shared-base';
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { discoverPosts } from '@/app/(normal)/helpers/discoverPosts.js';
import BlackHoleIcon from '@/assets/black-hole.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { VirtualList } from '@/components/VirtualList/index.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';
import { ScrollListKey, SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { batchUpdatePostDetail } from '@/helpers/batchUpdatePostDetail.js';
import { mergeThreadPosts } from '@/helpers/mergeThreadPosts.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface Props {
    // the source of the posts
    source: SocialPlatform;
    // the pageable posts from RSC
    pageable?: Pageable<Post, PageIndicator>;
}

export function Home({ source, pageable }: Props) {
    const setScrollIndex = useGlobalState.use.setScrollIndex();
    const currentSource = useGlobalState.use.currentSource();

    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: ['posts', currentSource, 'discover'],
        networkMode: 'always',

        queryFn: async ({ pageParam }) => {
            // return the first page if the pageParam is empty
            if (pageParam === '' && pageable?.data.length && source === currentSource) return pageable;

            const posts = await discoverPosts(currentSource, createIndicator(undefined, pageParam));
            if (currentSource === SocialPlatform.Lens) fetchAndStoreViews(posts.data.flatMap((x) => [x.postId]));
            return posts;
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => {
            const result = data?.pages.flatMap((x) => x.data) || EMPTY_LIST;
            return mergeThreadPosts(currentSource, result);
        },
    });

    const onEndReached = useCallback(async () => {
        if (!hasNextPage || isFetching || isFetchingNextPage) {
            return;
        }

        await fetchNextPage();
    }, [hasNextPage, isFetching, isFetchingNextPage, fetchNextPage]);

    useNavigatorTitle(t`Discover`);

    if (data.length === 0) {
        return (
            <div>
                <NoResultsFallback
                    className="pt-[228px]"
                    icon={<BlackHoleIcon width={200} height="auto" className="text-secondaryMain" />}
                    message={
                        <div className="mt-10">
                            <Trans>There is no data available for display.</Trans>
                        </div>
                    }
                />
            </div>
        );
    }

    return (
        <div>
            <VirtualList
                listKey={ScrollListKey.Discover}
                computeItemKey={(index, post) => `${post.postId}-${index}`}
                data={data}
                endReached={onEndReached}
                itemContent={(index, post) =>
                    getPostItemContent(index, post, {
                        onClick: () => {
                            setScrollIndex(ScrollListKey.Discover, index);
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
