import { type NftRedPacketJSONPayload } from '@masknet/web3-providers/types';
import { type NonFungibleCollection } from '@masknet/web3-shared-base';
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm';
interface NftRedPacketHistoryItemProps {
    history: NftRedPacketJSONPayload;
    collections: Array<NonFungibleCollection<ChainId, SchemaType>>;
    onSend: (history: NftRedPacketJSONPayload, contract: NonFungibleCollection<ChainId, SchemaType>) => void;
}
export declare const NftRedPacketHistoryItem: import("react").NamedExoticComponent<NftRedPacketHistoryItemProps>;
export {};
//# sourceMappingURL=NftRedPacketHistoryItem.d.ts.map