import {
    HappyRedPacketV1ABI,
    HappyRedPacketV2ABI,
    HappyRedPacketV3ABI,
    HappyRedPacketV4ABI,
    type HappyRedPacketV1,
    type HappyRedPacketV2,
    type HappyRedPacketV3,
    type HappyRedPacketV4,
} from '@/mask/bindings/constants.js';
import { useContract } from '@masknet/web3-hooks-evm';

import { type ChainId, useRedPacketConstants } from '@masknet/web3-shared-evm';
import type { AbiItem } from 'web3-utils';

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
