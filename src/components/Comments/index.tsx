import { Trans } from '@lingui/macro';
import { createIndicator, createPageable, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo } from 'react';

import MessageIcon from '@/assets/message.svg';
import { CommentsFooter, type CommentsFooterProps } from '@/components/Comments/CommentsFooter.js';
import { LensHideComments } from '@/components/LensHideComments.js';
import { ListInPage } from '@/components/ListInPage.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { ScrollListKey, type SocialSource, Source } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

export interface CommentListProps {
    postId: string;
    source: SocialSource;
    exclude?: string[];
}

export const CommentList = memo<CommentListProps>(function CommentList({ postId, source, exclude = [] }) {
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'comments', postId],
        queryFn: async ({ pageParam }) => {
            if (!postId) return createPageable<Post>(EMPTY_LIST, createIndicator());

            const provider = resolveSocialMediaProvider(source);
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
            return data.pages.flatMap((x) => x.data).filter((x) => !exclude.includes(x.postId));
        },
    });

    return (
        <>
            <ListInPage<Post, CommentsFooterProps['context']>
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
                    icon: <MessageIcon width={24} height={24} />,
                    message: <Trans>Be the first one to comment!</Trans>,
                }}
            />
            {queryResult.data.length <= 0 && source === Source.Lens ? (
                <LensHideComments postId={postId} className="border-t-[1px] border-t-line" />
            ) : null}
        </>
    );
});
