import { FireflyRedPacketAPI } from '@masknet/web3-providers/types';
import { type UseSuspenseInfiniteQueryResult, type InfiniteData } from '@tanstack/react-query';
import type { Pageable, PageIndicator } from '@masknet/shared-base';
export declare function useRedPacketHistory(address: string, historyType: FireflyRedPacketAPI.ActionType, platform?: FireflyRedPacketAPI.SourceType): UseSuspenseInfiniteQueryResult<InfiniteData<Pageable<FireflyRedPacketAPI.RedPacketClaimedInfo | FireflyRedPacketAPI.RedPacketSentInfo, PageIndicator>>>;
//# sourceMappingURL=useRedPacketHistory.d.ts.map