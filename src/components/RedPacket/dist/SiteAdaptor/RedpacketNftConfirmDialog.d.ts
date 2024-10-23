import { type ChainId, type SchemaType, type GasConfig } from '@masknet/web3-shared-evm';
import type { NonFungibleToken, NonFungibleCollection } from '@masknet/web3-shared-base';
interface RedpacketNftConfirmDialogProps {
    onBack: () => void;
    onClose: () => void;
    contract: NonFungibleCollection<ChainId, SchemaType>;
    tokenList: Array<NonFungibleToken<ChainId, SchemaType>>;
    message: string;
    senderName: string;
    gasOption?: GasConfig;
}
export declare function RedpacketNftConfirmDialog(props: RedpacketNftConfirmDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=RedpacketNftConfirmDialog.d.ts.map