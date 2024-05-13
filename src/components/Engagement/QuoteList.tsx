import { createIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import type { PostEngagementListProps } from '@/components/Engagement/type.js';
import { ListInPage } from '@/components/ListInPage.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { EngagementType, ScrollListKey } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Post } from '@/providers/types/SocialMedia.js';

function getPostContent(index: number, post: Post) {
    return <SinglePost key={post.publicationId} post={post} index={index} />;
}

export function QuoteList({ postId, type, source }: PostEngagementListProps) {
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: [type === EngagementType.Quotes ? 'posts' : 'profiles', source, 'engagements', type, postId],
        queryFn: async ({ pageParam }) => {
            const provider = resolveSocialMediaProvider(source);
            return provider.getPostsQuoteOn(postId, createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => {
            if (lastPage?.data.length === 0) return undefined;
            return lastPage?.nextIndicator?.id;
        },
        select(data) {
            return data.pages.flatMap((x) => x.data);
        },
    });
    const listKey = `${ScrollListKey.Engagement}:${postId}:${type}`;
    return (
        <ListInPage
            key={type}
            queryResult={queryResult}
            VirtualListProps={{
                listKey,
                computeItemKey: (index, post) => `${post.postId}-${index}`,
                itemContent: getPostContent,
            }}
            NoResultsFallbackProps={{
                className: 'mt-20',
            }}
        />
    );
}
