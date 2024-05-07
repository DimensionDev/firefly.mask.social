'use client';
import { createIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { ScrollListKey, type SocialSource } from '@/constants/enum.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getPostsSelector } from '@/helpers/getPostsSelector.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';

interface Props {
    source: SocialSource;
}

export function BookmarkList({ source }: Props) {
    console.log('sources', source);
    const query = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'bookmark'],
        queryFn: async ({ pageParam }) => {
            const provider = resolveSocialMediaProvider(source);
            if (!provider) return;
            try {
                const result = await provider.getBookmarks(createIndicator(undefined, pageParam));
                return result;
            } catch (error) {
                enqueueErrorMessage('Failed to fetch bookmarks', { error });
                return;
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => {
            if (lastPage?.data.length === 0) return undefined;
            return lastPage?.nextIndicator?.id;
        },
        select: getPostsSelector(source),
    });
    return (
        <ListInPage
            key={source}
            queryResult={query}
            VirtualListProps={{
                listKey: `${ScrollListKey.Bookmark}:${source}`,
                computeItemKey: (index, post) => `${post.publicationId}-${post.postId}-${index}`,
                itemContent: (index, post) => getPostItemContent(index, post, `${ScrollListKey.Bookmark}:${source}`),
            }}
            NoResultsFallbackProps={{
                className: 'mt-20',
            }}
        />
    );
}
