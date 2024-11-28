import { type ChainId, type GasConfig } from '@masknet/web3-shared-evm';
import { type RedPacketSettings } from '../../src/SiteAdaptor/hooks/useCreateCallback.tsx';
interface RedPacketFormProps {
    setERC721DialogHeight?: (height: number) => void;
    gasOption?: GasConfig;
    expectedChainId: ChainId;
    origin?: RedPacketSettings;
    onClose: () => void;
    onNext: () => void;
    onGasOptionChange?: (config: GasConfig) => void;
    onChange(settings: RedPacketSettings): void;
    onChainChange(newChainId: ChainId): void;
}
export declare function RedPacketERC20Form(props: RedPacketFormProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=RedPacketERC20Form.d.ts.map
