'use client';

import { Trans } from '@lingui/macro';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';

import { getActivityListItem } from '@/components/Activity/ActivityListItem.js';
import { NavigationBar } from '@/components/Activity/NavigationBar.js';
import { ListInPage } from '@/components/ListInPage.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { createIndicator } from '@/helpers/pageable.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { getFireflyActivityList } from '@/services/getFireflyActivityList.js';

export default function Page() {
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['activity-list'],
        queryFn: async ({ pageParam }) => {
            return getFireflyActivityList({ indicator: createIndicator(undefined, pageParam) });
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => {
            if (lastPage?.data.length === 0) return;
            return lastPage?.nextIndicator?.id;
        },
        select: (data) => compact(data.pages.flatMap((x) => x?.data)),
    });

    return (
        <div className="flex w-full flex-col">
            {fireflyBridgeProvider.supported ? (
                <NavigationBar>
                    <Trans>Exclusive Events</Trans>
                </NavigationBar>
            ) : null}
            <div className="flex w-full flex-col p-4">
                <ListInPage
                    source={Source.Wallet}
                    queryResult={queryResult}
                    VirtualListProps={{
                        listKey: `${ScrollListKey.Activity}`,
                        itemContent: getActivityListItem,
                    }}
                    NoResultsFallbackProps={{
                        className: 'md:pt-[228px] max-md:py-20',
                    }}
                />
            </div>
        </div>
    );
}
