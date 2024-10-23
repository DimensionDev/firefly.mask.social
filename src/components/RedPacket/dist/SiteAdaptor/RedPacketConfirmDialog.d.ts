import { type GasConfig, type ChainId } from '@masknet/web3-shared-evm';
import { type RedPacketJSONPayload } from '@masknet/web3-providers/types';
import { type RedPacketSettings } from './hooks/useCreateCallback.js';
interface ConfirmRedPacketFormProps {
    onCreated: (payload: RedPacketJSONPayload) => void;
    onBack: () => void;
    onClose: () => void;
    settings: RedPacketSettings;
    gasOption?: GasConfig;
    onGasOptionChange?: (config: GasConfig) => void;
    expectedChainId: ChainId;
}
export declare function RedPacketConfirmDialog(props: ConfirmRedPacketFormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=RedPacketConfirmDialog.d.ts.map