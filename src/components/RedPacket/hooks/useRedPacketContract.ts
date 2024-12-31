import { type ChainId, useRedPacketConstants } from '@masknet/web3-shared-evm';

import {
    type HappyRedPacketV1,
    HappyRedPacketV1ABI,
    type HappyRedPacketV2,
    HappyRedPacketV2ABI,
    type HappyRedPacketV3,
    HappyRedPacketV3ABI,
    type HappyRedPacketV4,
    HappyRedPacketV4ABI,
} from '@/mask/constants.js';
import { useContract } from '@/mask/hooks.js';

export function useRedPacketContract(chainId: ChainId, version: number) {
    const {
        HAPPY_RED_PACKET_ADDRESS_V1: addressV1,
        HAPPY_RED_PACKET_ADDRESS_V2: addressV2,
        HAPPY_RED_PACKET_ADDRESS_V3: addressV3,
        HAPPY_RED_PACKET_ADDRESS_V4: addressV4,
    } = useRedPacketConstants(chainId);
    const v1 = useContract<HappyRedPacketV1>(chainId, addressV1, HappyRedPacketV1ABI as any[]);
    const v2 = useContract<HappyRedPacketV2>(chainId, addressV2, HappyRedPacketV2ABI as any[]);
    const v3 = useContract<HappyRedPacketV3>(chainId, addressV3, HappyRedPacketV3ABI as any[]);
    const v4 = useContract<HappyRedPacketV4>(chainId, addressV4, HappyRedPacketV4ABI as any[]);
    const versions = [v1, v2, v3, v4] as const;

    return versions[version - 1];
}
