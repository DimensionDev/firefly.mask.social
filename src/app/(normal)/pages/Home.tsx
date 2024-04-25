'use client';

import { t } from '@lingui/macro';
import { createIndicator, createPageable, EMPTY_LIST, type Pageable, type PageIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { ScrollListKey, SocialPlatform } from '@/constants/enum.js';
import { getPostsSelector } from '@/helpers/getPostsSelector.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

async function discoverPosts(source: SocialPlatform, indicator: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
    const provider = resolveSocialMediaProvider(source);
    if (!provider) return createPageable(EMPTY_LIST, indicator);
    return provider.discoverPosts(indicator);
}

interface Props {
    // the source of the posts
    source: SocialPlatform;
    // the pageable posts from RSC
    pageable?: Pageable<Post, PageIndicator>;
}

export function HomePage({ source, pageable }: Props) {
    const currentSource = useGlobalState.use.currentSource();

    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const queryResult = useSuspenseInfiniteQuery({
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
        select: getPostsSelector(currentSource),
    });

    useNavigatorTitle(t`Discover`);

    return (
        <ListInPage
            key={source}
            queryResult={queryResult}
            VirtualListProps={{
                listKey: `${ScrollListKey.Discover}:${source}`,
                computeItemKey: (index, post) => `${post.postId}-${index}`,
                itemContent: (index, post) => getPostItemContent(index, post, `${ScrollListKey.Discover}:${source}`),
            }}
            NoResultsFallbackProps={{
                className: 'pt-[228px]',
            }}
        />
    );
}
