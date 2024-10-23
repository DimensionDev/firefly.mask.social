import type { NonFungibleCollection } from '@masknet/web3-shared-base';
import { SchemaType, type ChainId } from '@masknet/web3-shared-evm';
import { type NftRedPacketJSONPayload } from '@masknet/web3-providers/types';
import type { HTMLProps } from 'react';
interface Props extends HTMLProps<HTMLDivElement> {
    onSend: (history: NftRedPacketJSONPayload, contract: NonFungibleCollection<ChainId, SchemaType>) => void;
}
export declare function NftRedPacketHistoryList({ onSend, ...rest }: Props): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=NftRedPacketHistoryList.d.ts.map