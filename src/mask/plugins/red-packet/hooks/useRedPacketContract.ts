import { type ChainId, useRedPacketConstants } from '@masknet/web3-shared-evm';
import type { AbiItem } from 'web3-utils';

import {
    type HappyRedPacketV1,
    HappyRedPacketV1ABI,
    type HappyRedPacketV2,
    HappyRedPacketV2ABI,
    type HappyRedPacketV3,
    HappyRedPacketV3ABI,
    type HappyRedPacketV4,
    HappyRedPacketV4ABI,
} from '@/mask/bindings/constants.js';
import { useContract } from '@/mask/bindings/hooks.js';

export function useRedPacketContract(chainId: ChainId, version: number) {
    const {
        HAPPY_RED_PACKET_ADDRESS_V1: addressV1,
        HAPPY_RED_PACKET_ADDRESS_V2: addressV2,
        HAPPY_RED_PACKET_ADDRESS_V3: addressV3,
        HAPPY_RED_PACKET_ADDRESS_V4: addressV4,
    } = useRedPacketConstants(chainId);
    const v1 = useContract<HappyRedPacketV1>(chainId, addressV1, HappyRedPacketV1ABI as AbiItem[]);
    const v2 = useContract<HappyRedPacketV2>(chainId, addressV2, HappyRedPacketV2ABI as AbiItem[]);
    const v3 = useContract<HappyRedPacketV3>(chainId, addressV3, HappyRedPacketV3ABI as AbiItem[]);
    const v4 = useContract<HappyRedPacketV4>(chainId, addressV4, HappyRedPacketV4ABI as AbiItem[]);
    const versions = [v1, v2, v3, v4] as const;
    return versions[version - 1];
}