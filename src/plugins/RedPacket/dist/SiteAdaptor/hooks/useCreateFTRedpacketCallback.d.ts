import type { RedPacketJSONPayload } from '@masknet/web3-providers/types';
import { type GasConfig } from '@masknet/web3-shared-evm';

import { type RedPacketSettings } from '@/plugins/RedPacket/src/SiteAdaptor/hooks/useCreateCallback.ts';

export declare function useCreateFTRedpacketCallback(publicKey: string, privateKey: string, settings: RedPacketSettings, gasOption?: GasConfig, onCreated?: (payload: RedPacketJSONPayload) => void, onClose?: () => void, currentAccount?: string): {
    createRedpacket: () => Promise<void>;
    isCreating: boolean;
    formatAvg: string;
    formatTotal: string;
    isBalanceInsufficient: boolean;
    isWaitGasBeMinus: boolean;
    gas: string | undefined;
    estimateGasFee: string | undefined;
};
// # sourceMappingURL=useCreateFTRedpacketCallback.d.ts.map
