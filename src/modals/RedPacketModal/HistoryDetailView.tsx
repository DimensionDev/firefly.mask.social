import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useLocation } from '@tanstack/react-router';
import { first } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import type { Address } from 'viem';
import { useEnsName } from 'wagmi';

import { VirtualList } from '@/components/VirtualList/VirtualList.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';
import { formatBalance } from '@/helpers/formatBalance.js';
import { createIndicator } from '@/helpers/pageable.js';
import { RedPacketAccountItem } from '@/modals/RedPacketModal/RedPacketAccountItem.js';
import { RedPacketDetailItem } from '@/modals/RedPacketModal/RedPacketDetailItem.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';
import type { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';

function ClaimHistoryItem({ data }: { data: FireflyRedPacketAPI.ClaimList }) {
    const { data: ens } = useEnsName({ address: data.creator as Address });

    return (
        <div className="mt-3 flex items-center justify-between px-3 text-[14px] font-bold leading-[18px]">
            <RedPacketAccountItem ens={ens ?? ''} address={data.creator} />
            <div className="flex gap-1">
                {formatBalance(data.token_amounts, data.token_decimal, {
                    significant: 6,
                    isPrecise: true,
                })}
                {data.token_symbol}
            </div>
        </div>
    );
}

function getClaimHistoryListItem(data: FireflyRedPacketAPI.ClaimList) {
    return <ClaimHistoryItem key={data.creator} data={data} />;
}

export function HistoryDetailView() {
    const { rpid } = useLocation().search as {
        rpid: string;
    };

    const {
        data: claimData,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
    } = useSuspenseInfiniteQuery({
        queryKey: ['fireflyClaimHistory', rpid],
        initialPageParam: '',
        queryFn: async ({ pageParam }) => {
            const res = await FireflyRedPacket.getClaimHistory(rpid, createIndicator(undefined, pageParam as string));
            return res;
        },
        getNextPageParam: (lastPage) => lastPage?.cursor,
    });

    const onEndReached = useCallback(async () => {
        if (!hasNextPage || isFetching || isFetchingNextPage) {
            return;
        }
        await fetchNextPage();
    }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);

    const { claimInfo, claimList } = useMemo(
        () => ({ claimList: claimData?.pages.flatMap((x) => x?.list) ?? [], claimInfo: first(claimData?.pages) }),
        [claimData],
    );

    return (
        <div className="flex flex-grow flex-col overflow-auto px-4 py-3">
            {claimInfo ? <RedPacketDetailItem history={{ ...claimInfo, redpacket_id: rpid }} isDetail /> : null}
            {claimList.length ? (
                <VirtualList
                    data={claimList}
                    endReached={onEndReached}
                    components={{ Footer: VirtualListFooter }}
                    className="no-scrollbar box-border h-full min-h-0 flex-1"
                    listKey={`redpacket_${rpid}`}
                    computeItemKey={(index, item) => item.creator || 'Unknown User'}
                    itemContent={(index, item) => getClaimHistoryListItem(item)}
                />
            ) : (
                <div />
            )}
        </div>
    );
}
