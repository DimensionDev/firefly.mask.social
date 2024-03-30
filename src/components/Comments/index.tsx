import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { createIndicator, createPageable } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo, useMemo } from 'react';
import { useInView } from 'react-cool-inview';

import LoadingIcon from '@/assets/loading.svg';
import MessageIcon from '@/assets/message.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

export interface CommentListProps {
    postId: string;
    source: SocialPlatform;
    exclude?: string[];
}

export const CommentList = memo<CommentListProps>(function CommentList({ postId, source, exclude = [] }) {
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: ['post-detail', 'comments', source, postId],
        queryFn: async ({ pageParam }) => {
            if (!postId) return createPageable(EMPTY_LIST, undefined);
            switch (source) {
                case SocialPlatform.Lens:
                    const result = await LensSocialMediaProvider.getCommentsById(
                        postId,
                        createIndicator(undefined, pageParam),
                    );
                    const ids = result.data.flatMap((x) => [x.postId]);
                    await fetchAndStoreViews(ids);
                    return result;
                case SocialPlatform.Farcaster:
                    return FireflySocialMediaProvider.getCommentsById(postId, createIndicator(undefined, pageParam));
                default:
                    safeUnreachable(source);
                    return createPageable(EMPTY_LIST, undefined);
            }
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

    const results = useMemo(
        () => data.pages.flatMap((x) => x.data).filter((x) => !exclude.includes(x.postId)),
        [data, exclude],
    );

    return (
        <div>
            {results.length ? (
                results.map((x) => <SinglePost isComment post={x} key={x.postId} showMore />)
            ) : (
                <NoResultsFallback
                    icon={<MessageIcon width={24} height={24} />}
                    message={<Trans>Be the first one to comment!</Trans>}
                />
            )}
            {hasNextPage && results.length ? (
                <div className="flex items-center justify-center p-2" ref={observe}>
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                </div>
            ) : null}
        </div>
    );
});
