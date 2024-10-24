import { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

interface HistoryInfo {
    rp_msg: string;
    redpacket_id: string;
    received_time?: string;
    token_decimal: number;
    total_amounts?: string;
    token_symbol: string;
    token_amounts?: string;
    token_logo: string;
    chain_id: number;
    creator?: string;
    claim_numbers?: string;
    total_numbers?: string;
    claim_amounts?: string;
    create_time?: number;
    redpacket_status?: FireflyRedPacketAPI.RedPacketStatus;
    ens_name?: string;
    claim_strategy?: FireflyRedPacketAPI.StrategyPayload[];
    share_from?: string;
    theme_id?: string;
    post_on?: Array<{
        platform: FireflyRedPacketAPI.PlatformType;
        postId: string;
        handle?: string;
    }>;
}
interface Props {
    history: HistoryInfo;
    handleOpenDetails?: (rpid: string) => void;
    isDetail?: boolean;
}
export declare const FireflyRedPacketDetailsItem: import("react").NamedExoticComponent<Props>;
export {};
// # sourceMappingURL=FireflyRedPacketDetailsItem.d.ts.map