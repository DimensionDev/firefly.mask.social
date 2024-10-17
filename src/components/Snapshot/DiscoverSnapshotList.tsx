'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo } from 'react';

import { ListInPage } from '@/components/ListInPage.js';
import { getSnapshotItemContent } from '@/components/VirtualList/getSnapshotItemContent.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { createIndicator } from '@/helpers/pageable.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export const DiscoverSnapshotList = memo(function DiscoverSnapshotList() {
    const snapshotQueryResult = useSuspenseInfiniteQuery({
        queryKey: ['snapshots', 'discover'],
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
            source={Source.DAO}
            queryResult={snapshotQueryResult}
            NoResultsFallbackProps={{
                className: 'md:pt-[228px] max-md:py-20',
            }}
            VirtualListProps={{
                listKey: `${ScrollListKey.Discover}:${Source.DAO}`,
                computeItemKey: (index, snapshot) => `${snapshot.id}-${index}`,
                itemContent: (index, snapshot) => getSnapshotItemContent(index, snapshot),
            }}
        />
    );
});
