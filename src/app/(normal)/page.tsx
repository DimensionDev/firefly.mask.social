import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { createIndicator, createPageable, type Pageable, type PageIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useInView } from 'react-cool-inview';

import BlackHoleIcon from '@/assets/BlackHole.svg';
import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

const fetchPosts = async (source: SocialPlatform, indicator: PageIndicator): Promise<Pageable<Post, PageIndicator>> => {
    switch (source) {
        case SocialPlatform.Lens:
            return LensSocialMediaProvider.discoverPosts(indicator);
        case SocialPlatform.Farcaster:
            return FarcasterSocialMediaProvider.discoverPosts(indicator);
        default:
            safeUnreachable(source);
            return createPageable([], indicator);
    }
};

function Page({ pageable }: { pageable: Pageable<Post, PageIndicator> }) {
    const currentSource = useGlobalState.use.currentSource();

    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: ['discover', currentSource],
        networkMode: 'always',

        queryFn: async ({ pageParam }) => {
            // return the first page if the pageParam is empty
            if (pageParam === '' && pageable) return pageable;

            const posts = await fetchPosts(currentSource, createIndicator(undefined, pageParam));
            if (currentSource === SocialPlatform.Lens) fetchAndStoreViews(posts.data.flatMap((x) => [x.postId]));
            return posts;
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
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

    const posts = useMemo(() => data?.pages.flatMap((x) => x.data) || EMPTY_LIST, [data?.pages]);

    useNavigatorTitle(t`Discover`);

    return (
        <div>
            {posts.length ? (
                posts.map((x) => <SinglePost post={x} key={x.postId} showMore />)
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
            {hasNextPage && posts.length ? (
                <div className="flex items-center justify-center p-2" ref={observe}>
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                </div>
            ) : null}
        </div>
    );
}

export default async function Home() {
    const posts = await fetchPosts(SocialPlatform.Farcaster, '');

    return <Page pageable={posts} />;
}
