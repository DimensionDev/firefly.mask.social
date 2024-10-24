import { FireflyRedPacketAPI, type RedPacketJSONPayload } from '@masknet/web3-providers/types';
import { type GasConfig } from '@masknet/web3-shared-evm';

import { type RedPacketSettings } from '@/plugins/RedPacket/src/SiteAdaptor/hooks/useCreateCallback.ts';
import { type FireflyContext, type FireflyRedpacketSettings } from '@/plugins/RedPacket/src/types.ts';

export interface FireflyRedpacketConfirmDialogProps {
    settings: RedPacketSettings;
    fireflySettings?: FireflyRedpacketSettings;
    fireflyContext: FireflyContext;
    gasOption?: GasConfig;
    onCreated: (payload: RedPacketJSONPayload, payloadImage?: string, claimRequirements?: FireflyRedPacketAPI.StrategyPayload[], publicKey?: string) => void;
    onClose: () => void;
}
export declare function FireflyRedpacketConfirmDialog({ settings, fireflySettings, fireflyContext, gasOption, onCreated, onClose, }: FireflyRedpacketConfirmDialogProps): import("react/jsx-runtime").JSX.Element | null;
// # sourceMappingURL=FireflyRedpacketConfirmDialog.d.ts.map
