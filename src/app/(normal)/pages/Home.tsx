'use client';

import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { createIndicator, type Pageable, type PageIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-cool-inview';

import { discoverPosts } from '@/app/(normal)/helpers/discoverPosts.js';
import BlackHoleIcon from '@/assets/black-hole.svg';
import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { getFarcasterThreadsAndPosts } from '@/helpers/getFarcasterThreadsAndPosts.js';
import { getLensThreadsAndPosts } from '@/helpers/getLensThreadsAndPosts.js';
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
    const currentSource = useGlobalState.use.currentSource();

    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: ['discover', currentSource],
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
            switch (currentSource) {
                case SocialPlatform.Lens:
                    return getLensThreadsAndPosts(result);
                case SocialPlatform.Farcaster:
                    return getFarcasterThreadsAndPosts(result);
                default:
                    safeUnreachable(currentSource);
                    return result;
            }
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

    useNavigatorTitle(t`Discover`);

    return (
        <div>
            {data.length ? (
                data.map((x) => <SinglePost post={x} key={x.postId} showMore />)
            ) : (
                <NoResultsFallback
                    className="pt-[228px]"
                    icon={<BlackHoleIcon width={200} height="auto" className="text-secondaryMain" />}
                    message={
                        <div className="mt-10">
                            <Trans>There is no data available for display.</Trans>
                        </div>
                    }
                />
            )}
            {hasNextPage && data.length ? (
                <div className="flex items-center justify-center p-2" ref={observe}>
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                </div>
            ) : null}
        </div>
    );
}
