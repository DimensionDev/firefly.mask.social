'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';

import { ListInPage } from '@/components/ListInPage.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { PolymarketActivityItem } from '@/components/Polymarket/PolymarketActivityItem.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { createIndicator } from '@/helpers/pageable.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { PolymarketActivity } from '@/providers/types/Firefly.js';

function getPolymarketActivityItemContent(index: number, activity: PolymarketActivity) {
    return <PolymarketActivityItem activity={activity} />;
}

type PolymarketTimeLineProps =
    | {
          address: string;
          isFollowing?: false;
      }
    | {
          address?: string;
          isFollowing: true;
      };

export function PolymarketTimeLine({ address, isFollowing }: PolymarketTimeLineProps) {
    const isLogin = useIsLogin();

    const queryKey = isFollowing ? ['polymarket', 'following'] : ['polymarket', 'profile', address];
    const queryResult = useSuspenseInfiniteQuery({
        queryKey,
        networkMode: 'always',
        queryFn: async ({ pageParam }) => {
            if (!isLogin || (!isFollowing && !address)) return;
            if (isFollowing) {
                return FireflyEndpointProvider.getFollowingPolymarketTimeline(
                    'all',
                    createIndicator(undefined, pageParam),
                );
            }
            return FireflyEndpointProvider.getProfilePolymarketTimeline(
                address,
                'all',
                createIndicator(undefined, pageParam),
            );
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
        select: (data) => compact(data.pages.flatMap((p) => p?.data)),
    });

    if (!isLogin) {
        return <NotLoginFallback source={Source.Polymarket} />;
    }

    return (
        <ListInPage
            source={Source.Wallet}
            queryResult={queryResult}
            VirtualListProps={{
                listKey: `${ScrollListKey.Polymarket}:${isFollowing ? 'following' : 'profile'}`,
                computeItemKey: (index, item) => `${item.eventSlug}-${index}`,
                itemContent: (index, item) => getPolymarketActivityItemContent(index, item),
            }}
            NoResultsFallbackProps={{
                className: 'md:pt-[228px] max-md:py-20',
            }}
        />
    );
}
