'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo } from 'react';
import { useAccount } from 'wagmi';

import { ListInPage } from '@/components/ListInPage.js';
import { getSnapshotItemContent } from '@/components/VirtualList/getSnapshotItemContent.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { createIndicator } from '@/helpers/pageable.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export const DiscoverSnapshotList = memo(function DiscoverSnapshotList() {
    const account = useAccount();
    const snapshotQueryResult = useSuspenseInfiniteQuery({
        queryKey: ['snapshots', account.address, 'discover'],
        networkMode: 'always',
        queryFn: async ({ pageParam }) => {
            return FireflySocialMediaProvider.discoverSnapshotActivity(createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => data.pages.flatMap((x) => x.data),
    });

    return (
        <ListInPage
            source={Source.DAOs}
            queryResult={snapshotQueryResult}
            NoResultsFallbackProps={{
                className: 'md:pt-[228px] max-md:py-20',
            }}
            VirtualListProps={{
                listKey: `${ScrollListKey.Discover}:${Source.DAOs}`,
                computeItemKey: (index, snapshot) => `${snapshot.id}-${index}`,
                itemContent: (index, snapshot) => getSnapshotItemContent(index, snapshot),
            }}
        />
    );
});
