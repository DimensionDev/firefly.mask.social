import { Trans } from '@lingui/macro';
import { createIndicator, createPageable } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo } from 'react';

import MessageIcon from '@/assets/message.svg';
import { ListInPage } from '@/components/ListInPage.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { ScrollListKey, SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

export interface CommentListProps {
    postId: string;
    source: SocialPlatform;
    exclude?: string[];
}

export const CommentList = memo<CommentListProps>(function CommentList({ postId, source, exclude = [] }) {
    const setScrollIndex = useGlobalState.use.setScrollIndex();
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'comments', postId],
        queryFn: async ({ pageParam }) => {
            if (!postId) return createPageable(EMPTY_LIST, undefined);

            const provider = resolveSocialMediaProvider(source);
            if (!provider) return createPageable(EMPTY_LIST, undefined);

            const comments = await provider.getCommentsById(postId, createIndicator(undefined, pageParam));

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

    return (
        <ListInPage
            key={source}
            queryResult={queryResult}
            VirtualListProps={{
                listKey: `${ScrollListKey.Comment}:${postId}`,
                computeItemKey: (index, post) => `${post.postId}-${index}`,
                itemContent: (index, post) =>
                    getPostItemContent(index, post, `${ScrollListKey.Comment}:${postId}`, { isComment: true }),
            }}
            NoResultsFallbackProps={{
                icon: <MessageIcon width={24} height={24} />,
                message: <Trans>Be the first one to comment!</Trans>,
            }}
        />
    );
});
