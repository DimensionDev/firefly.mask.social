import type { NonFungibleCollection,NonFungibleToken } from '@masknet/web3-shared-base';
import { type ChainId, type GasConfig,type SchemaType } from '@masknet/web3-shared-evm';

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
// # sourceMappingURL=RedpacketNftConfirmDialog.d.ts.map