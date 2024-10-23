import { FireflyRedPacketAPI, type RedPacketJSONPayload } from '@masknet/web3-providers/types';

interface RedPacketInHistoryListProps {
    history: FireflyRedPacketAPI.RedPacketSentInfo;
    onSelect: (payload: RedPacketJSONPayload) => void;
}
export declare const RedPacketInHistoryList: import("react").NamedExoticComponent<RedPacketInHistoryListProps>;
export {};
// # sourceMappingURL=RedPacketInHistoryList.d.ts.map