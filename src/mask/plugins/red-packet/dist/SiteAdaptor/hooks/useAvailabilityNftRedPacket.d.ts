import type { ChainId } from '@masknet/web3-shared-evm';
export declare function useAvailabilityNftRedPacket(id: string, from: string, chainId?: ChainId): import("@tanstack/react-query").UseQueryResult<{
    token_address: string;
    balance: string;
    total_pkts: string;
    expired: boolean;
    claimed_id: string;
    bit_status: string;
    0: string;
    1: string;
    2: string;
    3: boolean;
    4: string;
    5: string;
    isClaimed: boolean;
    totalAmount: number;
    claimedAmount: number;
    remaining: number;
    isClaimedAll: boolean;
    isCompleted: boolean;
    isEnd: boolean;
    bitStatusList: boolean[];
} | null, Error>;
//# sourceMappingURL=useAvailabilityNftRedPacket.d.ts.map