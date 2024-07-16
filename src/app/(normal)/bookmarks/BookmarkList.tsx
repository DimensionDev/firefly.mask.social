'use client';
import { t } from '@lingui/macro';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { ScrollListKey, type SocialSource, Source } from '@/constants/enum.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getPostsSelector } from '@/helpers/getPostsSelector.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { createIndicator } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface Props {
    source: SocialSource;
}

export function BookmarkList({ source }: Props) {
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);
    const isLogin = useIsLogin(currentSocialSource);
    const query = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'bookmark'],
        queryFn: async ({ pageParam }) => {
            if (!isLogin) return;
            if (source === Source.Farcaster && !fireflySessionHolder.session) {
                return;
            }
            const provider = resolveSocialMediaProvider(source);
            try {
                const result = await provider.getBookmarks(createIndicator(undefined, pageParam));
                return result;
            } catch (error) {
                enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to fetch bookmarks.`), { error });
                throw error;
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => {
            if (lastPage?.data.length === 0) return;
            return lastPage?.nextIndicator?.id;
        },
        select: getPostsSelector(source),
    });
    return (
        <ListInPage
            loginRequired
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
