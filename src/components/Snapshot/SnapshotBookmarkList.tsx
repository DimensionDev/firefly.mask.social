'use client';

import { t } from '@lingui/macro';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { useAccount } from 'wagmi';

import { ListInPage } from '@/components/ListInPage.js';
import { getSnapshotItemContent } from '@/components/VirtualList/getSnapshotItemContent.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { createIndicator } from '@/helpers/pageable.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { useIsLoginFirefly } from '@/hooks/useIsLogin.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export function SnapshotBookmarkList() {
    const account = useAccount();
    const currentProfileAll = useCurrentProfileAll();
    const isLogin = useIsLoginFirefly();

    const query = useSuspenseInfiniteQuery({
        queryKey: [
            'snapshots',
            account.address,
            Source.Snapshot,
            'bookmark',
            SORTED_SOCIAL_SOURCES.map((x) => currentProfileAll[x]?.profileId),
        ],
        queryFn: async ({ pageParam }) => {
            if (!isLogin) return;
            try {
                const result = await FireflySocialMediaProvider.getSnapshotBookmarks(
                    createIndicator(undefined, pageParam),
                );
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
        select: (data) => compact(data.pages.flatMap((x) => x?.data)),
    });

    useNavigatorTitle(t`Bookmarks`);

    return (
        <ListInPage
            source={Source.Snapshot}
            queryResult={query}
            loginRequired
            NoResultsFallbackProps={{
                className: 'md:pt-[228px] max-md:py-20',
            }}
            VirtualListProps={{
                listKey: `${ScrollListKey.Following}:${Source.Snapshot}`,
                computeItemKey: (index, snapshot) => `${snapshot.id}-${index}`,
                itemContent: (index, snapshot) => getSnapshotItemContent(index, snapshot),
            }}
        />
    );
}
