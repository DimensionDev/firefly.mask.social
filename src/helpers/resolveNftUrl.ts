import urlcat from 'urlcat';

import { ChainId } from '@/constants/ethereum.js';

export function resolveNftUrl(
    contractAddress: string,
    options?: {
        tokenId?: string;
        chainId?: ChainId | string | number | null;
    },
) {
    let basePath = `/nft/${contractAddress}`;
    if (options?.tokenId) {
        basePath = `${basePath}/${options?.tokenId}`;
    }
    return urlcat(basePath, {
        chainId: options?.chainId,
    });
}
