import {
    type InfiniteData,
    useSuspenseInfiniteQuery,
    type UseSuspenseInfiniteQueryResult,
} from '@tanstack/react-query';
import type { Hex } from 'viem';

import { createIndicator, type Pageable, type PageIndicator } from '@/helpers/pageable.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';
import { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';

export function useRedPacketHistory(
    address: string,
    historyType: FireflyRedPacketAPI.ActionType,
    platform?: FireflyRedPacketAPI.SourceType,
): UseSuspenseInfiniteQueryResult<
    InfiniteData<
        Pageable<FireflyRedPacketAPI.RedPacketClaimedInfo | FireflyRedPacketAPI.RedPacketSentInfo, PageIndicator>
    >
> {
    return useSuspenseInfiniteQuery({
        queryKey: ['RedPacketHistory', address, historyType],
        initialPageParam: createIndicator(undefined, ''),
        queryFn: async ({ pageParam }) => {
            const res = await FireflyRedPacket.getHistory(
                historyType,
                address as Hex,
                platform ? platform : FireflyRedPacketAPI.SourceType.All,
                pageParam,
            );
            return res;
        },
        getNextPageParam: (lastPage) => lastPage.nextIndicator,
    });
}
