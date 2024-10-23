import type { Pageable, PageIndicator } from '@masknet/shared-base';
import { createIndicator } from '@masknet/shared-base';
import { ActionType,
    type RedPacketClaimedInfo,
    type RedPacketSentInfo,
    SourceType} from '@/providers/types/RedPacket.js';
import {
    type InfiniteData,
    useSuspenseInfiniteQuery,
    type UseSuspenseInfiniteQueryResult,
} from '@tanstack/react-query';
import { FireflyRedPacket } from '@/providers/firefly/RedPacket.js';

export function useRedPacketHistory(
    address: string,
    historyType: ActionType,
    platform?: SourceType,
): UseSuspenseInfiniteQueryResult<
    InfiniteData<
        Pageable<RedPacketClaimedInfo | RedPacketSentInfo, PageIndicator>
    >
> {
    return useSuspenseInfiniteQuery({
        queryKey: ['RedPacketHistory', address, historyType],
        initialPageParam: createIndicator(undefined, ''),
        queryFn: async ({ pageParam }) => {
            const res = await FireflyRedPacket.getHistory(
                historyType,
                address as `0x${string}`,
                platform ? platform : SourceType.All,
                pageParam,
            );
            return res;
        },
        getNextPageParam: (lastPage) => lastPage.nextIndicator,
    });
}
