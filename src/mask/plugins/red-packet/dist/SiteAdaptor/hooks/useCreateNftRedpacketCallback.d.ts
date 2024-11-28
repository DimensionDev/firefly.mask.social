import type { AsyncFnReturn } from 'react-use/lib/useAsync.js';
import type { EventLog, TransactionReceipt } from 'web3-core';
import { type GasConfig } from '@masknet/web3-shared-evm';
export declare function useCreateNftRedpacketCallback(duration: number, message: string, name: string, contractAddress: string, tokenIdList: string[], gasOption?: GasConfig): AsyncFnReturn<(publicKey: string) => Promise<{
    hash: string;
    receipt: TransactionReceipt | null;
    events?: {
        [eventName: string]: EventLog | undefined;
    };
} | undefined>>;
//# sourceMappingURL=useCreateNftRedpacketCallback.d.ts.map