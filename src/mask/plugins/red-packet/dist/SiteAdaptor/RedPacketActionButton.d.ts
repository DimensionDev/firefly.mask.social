import { FireflyRedPacketAPI } from '@masknet/web3-providers/types';
import type { ChainId } from '@masknet/web3-shared-evm';
interface TokenInfo {
    symbol: string;
    decimals: number;
    amount?: string;
}
interface Props {
    rpid: string;
    account: string;
    redpacketStatus: FireflyRedPacketAPI.RedPacketStatus;
    claim_strategy?: FireflyRedPacketAPI.StrategyPayload[];
    shareFrom?: string;
    themeId?: string;
    tokenInfo: TokenInfo;
    redpacketMsg?: string;
    chainId: ChainId;
    totalAmount?: string;
    createdAt?: number;
}
export declare const RedPacketActionButton: import("react").NamedExoticComponent<Props>;
export {};
//# sourceMappingURL=RedPacketActionButton.d.ts.map