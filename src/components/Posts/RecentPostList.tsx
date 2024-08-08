import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo } from 'react';

import { ListInPage } from '@/components/ListInPage.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { getPostsSelector } from '@/helpers/getPostsSelector.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { createIndicator, createPageable } from '@/helpers/pageable.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export const RecentPostList = memo(function ForYouPostList() {
    const currentSource = useGlobalState.use.currentSource();
    const source = narrowToSocialSource(currentSource);

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'recent'],
        networkMode: 'always',
        queryFn: async ({ pageParam }) => {
            if (source !== Source.Lens) {
                return createPageable<Post>(EMPTY_LIST, createIndicator());
            }
            return LensSocialMediaProvider.getRecentPosts(createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: getPostsSelector(source),
    });

    return (
        <ListInPage
            key={currentSource}
            queryResult={queryResult}
            VirtualListProps={{
                listKey: `${ScrollListKey.Recent}:${currentSource}`,
                computeItemKey: (index, post) => `${post.postId}-${index}`,
                itemContent: (index, post) =>
                    getPostItemContent(index, post, `${ScrollListKey.Recent}:${currentSource}`),
            }}
            NoResultsFallbackProps={{
                className: 'pt-[228px]',
            }}
        />
    );
});
