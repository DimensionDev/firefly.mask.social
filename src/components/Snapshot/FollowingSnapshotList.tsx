'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { useAccount } from 'wagmi';

import { ListInPage } from '@/components/ListInPage.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { getSnapshotItemContent } from '@/components/VirtualList/getSnapshotItemContent.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { createIndicator } from '@/helpers/pageable.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export function FollowingSnapshotList({ walletAddress }: { walletAddress?: string }) {
    const account = useAccount();
    const currentProfileAll = useCurrentProfileAll();
    const profileIds = compact(SORTED_SOCIAL_SOURCES.map((x) => currentProfileAll[x]?.profileId));

    const queryKey = walletAddress
        ? ['snapshots', account.address, 'snapshots-of', walletAddress, profileIds]
        : ['snapshots', account.address, 'following', Source.Snapshot, profileIds];

    const queryResult = useSuspenseInfiniteQuery({
        queryKey,
        networkMode: 'always',
        queryFn: async ({ pageParam }) => {
            if (!profileIds.length) return;

            return FireflySocialMediaProvider.getFollowingSnapshotActivity({
                indicator: createIndicator(undefined, pageParam),
                walletAddresses: walletAddress ? [walletAddress] : undefined,
            });
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
        select: (data) => data.pages.flatMap((x) => x?.data ?? []),
    });

    if (!profileIds.length) {
        return <NotLoginFallback source={Source.Farcaster} />;
    }

    return (
        <ListInPage
            source={Source.Snapshot}
            queryResult={queryResult}
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
