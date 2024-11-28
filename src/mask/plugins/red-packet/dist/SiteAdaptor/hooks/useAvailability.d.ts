import type { ChainId, ProviderType, Transaction } from '@masknet/web3-shared-evm';
import type { BaseConnectionOptions } from '@masknet/web3-providers/types';
export declare function useAvailability(id: string, version: number, options?: BaseConnectionOptions<ChainId, ProviderType, Transaction>): import("@tanstack/react-query").UseQueryResult<{
    token_address: string;
    balance: string;
    total: string;
    claimed: string;
    expired: boolean;
    claimed_amount: string;
    0: string;
    1: string;
    2: string;
    3: string;
    4: boolean;
    5: string;
} | null, Error>;
//# sourceMappingURL=useAvailability.d.ts.map