import { getEnumAsArray } from '@masknet/kit';

import { ChainId } from '@/types/frame.js';

export function parseChainId(chainId: string): ChainId {
    if (!chainId.startsWith('eip155:')) throw new Error(`Invalid chain ID format: ${chainId}`);
    const chainIdParsed = Number.parseInt(chainId.split(':')[1], 10);
    if (isNaN(chainIdParsed) || chainIdParsed <= 0) throw new Error(`Invalid chain ID: ${chainId}`);
    if (!getEnumAsArray(ChainId).find((x) => x.value === chainIdParsed))
        throw new Error(`Unsupported chain ID: ${chainId}`);
    return chainIdParsed;
}
