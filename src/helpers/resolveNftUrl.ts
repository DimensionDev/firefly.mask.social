import { ChainId } from '@masknet/web3-shared-evm';
import urlcat from 'urlcat';

export function resolveNftUrl(chainId: ChainId | string | number, address: string, tokenId?: string) {
    const basePath = '/nft/:chainId/:address';
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
