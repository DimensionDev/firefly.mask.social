import { type ChainId } from '@masknet/web3-shared-evm';

export declare function useCreateNftRedPacketReceipt(txid: string, expectedChainId: ChainId): {
    retry: () => void;
    loading: boolean;
    error?: undefined;
    value?: undefined;
} | {
    retry: () => void;
    loading: false;
    error: Error;
    value?: undefined;
} | {
    retry: () => void;
    loading: true;
    error?: Error | undefined;
    value?: {
        rpid: string;
        creation_time: number;
    } | null | undefined;
} | {
    retry: () => void;
    loading: false;
    error?: undefined;
    value: {
        rpid: string;
        creation_time: number;
    } | null;
};
// # sourceMappingURL=useCreateNftRedPacketReceipt.d.ts.map