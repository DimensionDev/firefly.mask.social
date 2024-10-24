import type { NonFungibleCollection, NonFungibleToken } from '@masknet/web3-shared-base';
import { type ChainId,SchemaType } from '@masknet/web3-shared-evm';

export type OrderedERC721Token = NonFungibleToken<ChainId, SchemaType.ERC721> & {
    index: number;
};
interface SelectNftTokenDialogProps {
    onClose: () => void;
    contract: NonFungibleCollection<ChainId, SchemaType> | null | undefined;
    existTokenDetailedList: OrderedERC721Token[];
    tokenDetailedOwnerList: OrderedERC721Token[];
    setExistTokenDetailedList: React.Dispatch<React.SetStateAction<OrderedERC721Token[]>>;
}
export declare function SelectNftTokenDialog(props: SelectNftTokenDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
// # sourceMappingURL=SelectNftTokenDialog.d.ts.map