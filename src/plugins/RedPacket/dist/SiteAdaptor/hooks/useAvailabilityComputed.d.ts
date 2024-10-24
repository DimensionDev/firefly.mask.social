import { type RedPacketJSONPayload,RedPacketStatus } from '@masknet/web3-providers/types';
import type { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
/**
 * Fetch the red packet info from the chain
 * @param payload
 */
export declare function useAvailabilityComputed(account: string, payload: RedPacketJSONPayload): {
    availability: {
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
    } | null | undefined;
    checkAvailability: (options?: RefetchOptions) => Promise<QueryObserverResult<{
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
    } | null | undefined>>;
    payload: RedPacketJSONPayload;
    claimStrategyStatus: null;
    checkingClaimStatus: boolean;
    recheckClaimStatus: () => Promise<boolean | undefined>;
    password: string | undefined;
    computed: {
        canClaim: boolean;
        canRefund: boolean;
        listOfStatus: RedPacketStatus[];
        canSend?: undefined;
        isPasswordValid?: undefined;
    };
} | {
    availability: {
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
    };
    checkAvailability: (options?: RefetchOptions) => Promise<QueryObserverResult<{
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
    } | null | undefined>>;
    claimStrategyStatus: {
        claimStrategyStatus: Array<import("@masknet/web3-providers/types").FireflyRedPacketAPI.ClaimStrategyStatus>;
        canClaim: boolean;
    } | undefined;
    recheckClaimStatus: () => Promise<boolean | undefined>;
    checkingClaimStatus: boolean;
    password: string | undefined;
    computed: {
        canClaim: boolean;
        canRefund: boolean;
        canSend: boolean;
        isPasswordValid: boolean;
        listOfStatus: RedPacketStatus[];
    };
    payload?: undefined;
};
// # sourceMappingURL=useAvailabilityComputed.d.ts.map