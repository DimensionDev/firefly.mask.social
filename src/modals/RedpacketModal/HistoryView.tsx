import { Trans } from '@lingui/macro';
import { useCallback, useState } from 'react';

import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { Tab, Tabs } from '@/components/Tabs/index.js';
import { VirtualList } from '@/components/VirtualList/VirtualList.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';
import { ScrollListKey } from '@/constants/enum.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { useRedPacketHistory } from '@/mask/plugins/red-packet/hooks/useRedPacketHistory.js';
import { RedpacketDetailItem } from '@/modals/RedpacketModal/RedpacketDetailItem.js';
import { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';

function getRedpacketHistoryItem(
    history: FireflyRedPacketAPI.RedPacketClaimedInfo | FireflyRedPacketAPI.RedPacketSentInfo,
    type: FireflyRedPacketAPI.ActionType,
) {
    return <RedpacketDetailItem type={type} history={history} key={history.redpacket_id} />;
}

export function HistoryView() {
    const [historyType, setHistoryType] = useState<FireflyRedPacketAPI.ActionType>(
        FireflyRedPacketAPI.ActionType.Claim,
    );
    const { account } = useChainContext();
    const {
        data: historiesData,
        fetchNextPage,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
    } = useRedPacketHistory(account, historyType);

    const onEndReached = useCallback(async () => {
        if (!hasNextPage || isFetching || isFetchingNextPage) {
            return;
        }
        await fetchNextPage();
    }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);
    console.log(historiesData);

    return (
        <div className="flex flex-1 flex-grow flex-col bg-primaryBottom px-4 py-2">
            <Tabs value={historyType} onChange={setHistoryType} variant="solid" className="self-start">
                <Tab value={FireflyRedPacketAPI.ActionType.Claim} key="claimed">
                    <Trans>Claimed</Trans>
                </Tab>
                <Tab value={FireflyRedPacketAPI.ActionType.Send} key="sent">
                    <Trans>Sent</Trans>
                </Tab>
            </Tabs>

            <div className="no-scrollbar box-border flex flex-grow flex-col gap-1 overflow-auto p-3">
                {historiesData.length ? (
                    <VirtualList
                        data={historiesData}
                        endReached={onEndReached}
                        components={{
                            Footer: VirtualListFooter,
                        }}
                        className="no-scrollbar box-border h-full min-h-0 flex-1"
                        listKey={`$${ScrollListKey.RedpacketHistory}`}
                        computeItemKey={(index, item) => item.redpacket_id}
                        itemContent={(index, history) => getRedpacketHistoryItem(history, historyType)}
                    />
                ) : (
                    <NoResultsFallback className="h-[478px] justify-center" />
                )}
            </div>
        </div>
    );
}
