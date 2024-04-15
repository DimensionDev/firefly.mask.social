import { Trans } from '@lingui/macro';
import { createIndicator, createPageable } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo, useCallback } from 'react';

import MessageIcon from '@/assets/message.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { VirtualList } from '@/components/VirtualList/index.js';
import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';

export interface CommentListProps {
    postId: string;
    source: SocialPlatform;
    exclude?: string[];
}

export const CommentList = memo<CommentListProps>(function CommentList({ postId, source, exclude = [] }) {
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const {
        data: results,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        isFetching,
    } = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'comments', source, postId],
        queryFn: async ({ pageParam }) => {
            if (!postId) return createPageable(EMPTY_LIST, undefined);

            const provider = resolveSocialMediaProvider(source);
            if (!provider) return createPageable(EMPTY_LIST, undefined);

            const comments = await provider?.getCommentsById(postId, createIndicator(undefined, pageParam));

            if (source === SocialPlatform.Lens) {
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

    const onEndReached = useCallback(async () => {
        if (!hasNextPage || isFetching || isFetchingNextPage) {
            return;
        }

        await fetchNextPage();
    }, [hasNextPage, isFetching, isFetchingNextPage, fetchNextPage]);

    if (results.length === 0) {
        return (
            <NoResultsFallback
                icon={<MessageIcon width={24} height={24} />}
                message={<Trans>Be the first one to comment!</Trans>}
            />
        );
    }

    return (
        <div>
            <VirtualList
                computeItemKey={(index, post) => `${post.postId}-${index}`}
                data={results}
                endReached={onEndReached}
                itemContent={(index, post) => getPostItemContent(index, post)}
                useWindowScroll
                context={{ hasNextPage }}
                components={{
                    Footer: VirtualListFooter,
                }}
            />
        </div>
    );
});
