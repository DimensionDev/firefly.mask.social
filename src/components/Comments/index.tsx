'use client';

import { Trans } from '@lingui/macro';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo } from 'react';

import MessagesIcon from '@/assets/messages.svg';
import { CommentsFooter, type CommentsFooterProps } from '@/components/Comments/CommentsFooter.js';
import { HideComments } from '@/components/HideComments.js';
import { ListInPage } from '@/components/ListInPage.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { ScrollListKey, type SocialSource, Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createIndicator, createPageable } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useAsyncStatus } from '@/hooks/useAsyncStatus.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface CommentListProps {
    postId: string;
    source: SocialSource;
    excludePostIds?: string[];
}

export const CommentList = memo<CommentListProps>(function CommentList({ postId, source, excludePostIds = [] }) {
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const twitterAsyncStatus = useAsyncStatus(Source.Twitter);

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'comments', postId, twitterAsyncStatus],
        queryFn: async ({ pageParam }) => {
            if (!postId) return createPageable<Post>(EMPTY_LIST, createIndicator());

            const provider = resolveSocialMediaProvider(source);
            if (source === Source.Twitter && twitterAsyncStatus)
                return createPageable<Post>(EMPTY_LIST, createIndicator(undefined, pageParam));
            const comments = await provider.getCommentsById(postId, createIndicator(undefined, pageParam));

            if (source === Source.Lens) {
                const ids = comments.data.flatMap((x) => [x.postId]);
                await fetchAndStoreViews(ids);
            }
            return comments;
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select(data) {
            return data.pages.flatMap((x) => x.data).filter((x) => !excludePostIds.includes(x.postId));
        },
    });

    return (
        <>
            <ListInPage<Post, CommentsFooterProps['context']>
                source={source}
                key={source}
                queryResult={queryResult}
                VirtualListProps={{
                    listKey: `${ScrollListKey.Comment}:${postId}`,
                    computeItemKey: (index, post) => `${post.postId}-${index}`,
                    itemContent: (index, post) =>
                        getPostItemContent(index, post, `${ScrollListKey.Comment}:${postId}`, { isComment: true }),
                    context: {
                        postId,
                        source,
                    },
                    components: {
                        Footer: CommentsFooter,
                    },
                }}
                NoResultsFallbackProps={{
                    icon: <MessagesIcon width={24} height={24} />,
                    message: <Trans>Be the first one to comment!</Trans>,
                }}
            />
            {queryResult.data.length <= 0 ? (
                <HideComments
                    source={source}
                    excludePostIds={excludePostIds}
                    postId={postId}
                    className="border-t-[1px] border-t-line"
                />
            ) : null}
        </>
    );
});
