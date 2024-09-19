'use client';

import { Trans } from '@lingui/macro';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo } from 'react';

import { ListInPage } from '@/components/ListInPage.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { ScrollListKey, type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { getPostsSelector } from '@/helpers/getPostsSelector.js';
import { createIndicator } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

export const FollowingPostList = memo<{
    source: SocialSource;
}>(function FollowingPostList({ source }) {
    const isLogin = useIsLogin(source);

    const currentProfileAll = useCurrentProfileAll();
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: [
            'posts',
            source,
            'following',
            isLogin,
            SORTED_SOCIAL_SOURCES.map((x) => currentProfileAll[x]?.profileId),
        ],
        queryFn: async ({ pageParam }) => {
            if (!isLogin) return;

            const currentProfile = currentProfileAll[source];
            if (!currentProfile?.profileId) return;

            const provider = resolveSocialMediaProvider(source);
            const posts = await provider.discoverPostsById(
                currentProfile.profileId,
                createIndicator(undefined, pageParam),
            );

            if (source === Source.Lens) {
                const ids = posts.data.flatMap((x) => [x.postId]);
                fetchAndStoreViews(ids);
            }

            return posts;
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
            key={source}
            queryResult={queryResult}
            loginRequired
            VirtualListProps={{
                listKey: `${ScrollListKey.Following}:${source}`,
                computeItemKey: (index, post) => `${post.postId}-${index}`,
                itemContent: (index, post) => getPostItemContent(index, post, `${ScrollListKey.Following}:${source}`),
            }}
            NoResultsFallbackProps={{
                className: 'md:pt-[228px] max-md:py-20',
                message: (
                    <div className="mt-10">
                        <Trans>Follow more friends to continue exploring on {resolveSourceName(source)}.</Trans>
                    </div>
                ),
            }}
        />
    );
});
