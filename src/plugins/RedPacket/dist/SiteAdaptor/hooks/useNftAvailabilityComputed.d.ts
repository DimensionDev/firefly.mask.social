import { type NftRedPacketJSONPayload, RedPacketStatus } from '@masknet/web3-providers/types';
/**
 * Fetch the red packet info from the chain
 * @param payload
 */
export declare function useNftAvailabilityComputed(account: string, payload: NftRedPacketJSONPayload): {
    canClaim: boolean;
    listOfStatus: RedPacketStatus[];
    canSend?: undefined;
    password?: undefined;
    isPasswordValid?: undefined;
} | {
    canClaim: boolean;
    canSend: boolean;
    password: string | undefined;
    isPasswordValid: boolean;
    listOfStatus: Array<RedPacketStatus.claimed | RedPacketStatus.expired | RedPacketStatus.empty>;
};
// # sourceMappingURL=useNftAvailabilityComputed.d.ts.map