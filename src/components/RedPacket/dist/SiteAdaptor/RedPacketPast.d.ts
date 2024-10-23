import { type RedPacketJSONPayload } from '@masknet/web3-providers/types';
interface Props {
    tabs: Record<'tokens' | 'collectibles', 'tokens' | 'collectibles'>;
    onSelect: (payload: RedPacketJSONPayload) => void;
    onClose?: () => void;
}
export declare const RedPacketPast: import("react").NamedExoticComponent<Props>;
export {};
//# sourceMappingURL=RedPacketPast.d.ts.map