import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo } from 'react';

import { ListInPage } from '@/components/ListInPage.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { getPostsSelector } from '@/helpers/getPostsSelector.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { createIndicator, createPageable } from '@/helpers/pageable.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export const ForYouPostList = memo(function ForYouPostList() {
    const currentSource = useGlobalState.use.currentSource();
    const source = narrowToSocialSource(currentSource);

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'for-you'],
        networkMode: 'always',
        queryFn: async ({ pageParam }) => {
            if (source !== Source.Farcaster) {
                return createPageable<Post>(EMPTY_LIST, createIndicator());
            }
            return FarcasterSocialMediaProvider?.getForYouPosts(createIndicator(undefined, pageParam));
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
                listKey: `${ScrollListKey.ForYou}:${currentSource}`,
                computeItemKey: (index, post) => `${post.postId}-${index}`,
                itemContent: (index, post) =>
                    getPostItemContent(index, post, `${ScrollListKey.ForYou}:${currentSource}`),
            }}
            NoResultsFallbackProps={{
                className: 'pt-[228px]',
            }}
        />
    );
});
