import { type RedPacketJSONPayload } from '@masknet/web3-providers/types';
import { type HTMLProps } from 'react';
interface RedPacketHistoryListProps extends Omit<HTMLProps<HTMLDivElement>, 'onSelect'> {
    onSelect: (payload: RedPacketJSONPayload) => void;
}
export declare const RedPacketHistoryList: import("react").NamedExoticComponent<RedPacketHistoryListProps>;
export {};
//# sourceMappingURL=RedPacketHistoryList.d.ts.map