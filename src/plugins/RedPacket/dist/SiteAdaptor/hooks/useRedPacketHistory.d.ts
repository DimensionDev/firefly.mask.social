import type { Pageable, PageIndicator } from '@masknet/shared-base';
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types';
import { type InfiniteData,type UseSuspenseInfiniteQueryResult } from '@tanstack/react-query';

export declare function useRedPacketHistory(address: string, historyType: FireflyRedPacketAPI.ActionType, platform?: FireflyRedPacketAPI.SourceType): UseSuspenseInfiniteQueryResult<InfiniteData<Pageable<FireflyRedPacketAPI.RedPacketClaimedInfo | FireflyRedPacketAPI.RedPacketSentInfo, PageIndicator>>>;
// # sourceMappingURL=useRedPacketHistory.d.ts.map