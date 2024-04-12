'use client';

import { useCallback, useMemo } from 'react';
import { t, Trans } from '@lingui/macro';
import { createIndicator, type Pageable, type PageIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { discoverPosts } from '@/app/(normal)/helpers/discoverPosts.js';
import BlackHoleIcon from '@/assets/black-hole.svg';
import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { ScrollListKey, SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { mergeThreadPosts } from '@/helpers/mergeThreadPosts.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';
import { VirtualList } from '@/components/VirtualList.js';

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

    const itemContent = useCallback(
        (index: number, post: Post) => {
            return (
                <SinglePost
                    post={post}
                    key={`${post.postId}-${index}`}
                    showMore
                    onClick={() => {
                        setScrollIndex(ScrollListKey.Discover, index);
                    }}
                />
            );
        },
        [setScrollIndex],
    );

    const Footer = useCallback(() => {
        if (!hasNextPage) return null;
        return (
            <div className="flex items-center justify-center p-2">
                <LoadingIcon width={16} height={16} className="animate-spin" />
            </div>
        );
    }, [hasNextPage]);

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
                itemContent={itemContent}
                useWindowScroll
                components={{
                    Footer,
                }}
            />
        </div>
    );
}
