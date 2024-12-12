import {
    useSuspenseInfiniteQuery,
} from '@tanstack/react-query';
import type { Hex } from 'viem';

import { createIndicator } from '@/helpers/pageable.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';
import { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';

export function useRedPacketHistory(
    address: string,
    historyType: FireflyRedPacketAPI.ActionType,
    platform?: FireflyRedPacketAPI.SourceType,
) {
    return useSuspenseInfiniteQuery({
        queryKey: ['redpacket-history', address, historyType],
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
        select: (data) => data.pages.flatMap((x) => x.data),
    });
}
