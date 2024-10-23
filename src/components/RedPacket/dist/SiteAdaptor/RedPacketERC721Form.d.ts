import { type GasConfig } from '@masknet/web3-shared-evm';
interface RedPacketERC721FormProps {
    onClose: () => void;
    openNFTConfirmDialog: boolean;
    openSelectNFTDialog: boolean;
    setOpenSelectNFTDialog: (x: boolean) => void;
    setOpenNFTConfirmDialog: (x: boolean) => void;
    setIsNFTRedPacketLoaded?: (x: boolean) => void;
    gasOption?: GasConfig;
    onGasOptionChange?: (config: GasConfig) => void;
}
export declare function RedPacketERC721Form(props: RedPacketERC721FormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=RedPacketERC721Form.d.ts.map