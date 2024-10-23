import { type RedPacketSettings } from './hooks/useCreateCallback.js';
import { type FireflyContext, type FireflyRedpacketSettings } from '../types.js';
import { FireflyRedPacketAPI, type RedPacketJSONPayload } from '@masknet/web3-providers/types';
import { type GasConfig } from '@masknet/web3-shared-evm';
export interface FireflyRedpacketConfirmDialogProps {
    settings: RedPacketSettings;
    fireflySettings?: FireflyRedpacketSettings;
    fireflyContext: FireflyContext;
    gasOption?: GasConfig;
    onCreated: (payload: RedPacketJSONPayload, payloadImage?: string, claimRequirements?: FireflyRedPacketAPI.StrategyPayload[], publicKey?: string) => void;
    onClose: () => void;
}
export declare function FireflyRedpacketConfirmDialog({ settings, fireflySettings, fireflyContext, gasOption, onCreated, onClose, }: FireflyRedpacketConfirmDialogProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=FireflyRedpacketConfirmDialog.d.ts.map