import { getEnumAsArray } from '@masknet/kit';

import { ChainId } from '@/constants/ethereum.js';

export function isValidChainId(chainId?: ChainId): chainId is ChainId {
    return getEnumAsArray(ChainId).some((x) => x.value === chainId);
}
