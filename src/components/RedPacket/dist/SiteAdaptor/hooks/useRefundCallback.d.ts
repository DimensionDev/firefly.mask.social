import { type ChainId } from '@masknet/web3-shared-evm';
export declare function useRefundCallback(version: number, from: string, id?: string, expectedChainId?: ChainId): readonly [{
    loading: boolean;
    error?: undefined;
    value?: undefined;
} | {
    loading: false;
    error: Error;
    value?: undefined;
} | {
    loading: true;
    error?: Error | undefined;
    value?: string | undefined;
} | {
    loading: false;
    error?: undefined;
    value: string | undefined;
}, boolean, () => Promise<string | undefined>];
//# sourceMappingURL=useRefundCallback.d.ts.map