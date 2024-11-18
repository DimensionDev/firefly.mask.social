import { ChainId } from '@masknet/web3-shared-evm';
import urlcat from 'urlcat';

export function resolveNftUrl(chainId: ChainId | string | number, address: string, tokenId?: string) {
    const basePath = address ? '/nft/:chainId/:address' : '/nft/:chainId';
    if (tokenId) {
        return urlcat(`${basePath}/:tokenId`, {
            tokenId,
            address,
            chainId,
        });
    }
    return urlcat(basePath, {
        address,
        chainId,
    });
}

export function resolveNftUrlByCollection(collectionId: string, tokenId?: string) {
    const basePath = '/nft/:collectionId';
    if (tokenId) {
        return urlcat(`${basePath}/:tokenId`, {
            tokenId,
            collectionId,
        });
    }
    return urlcat(basePath, {
        collectionId,
    });
}
