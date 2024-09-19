import { ChainId } from '@masknet/web3-shared-evm';
import urlcat from 'urlcat';

export function resolveNftUrl(
    contractAddress: string,
    options?: {
        tokenId?: string;
        chainId?: ChainId | string | number | null;
    },
) {
    let basePath = `/nft/${contractAddress.toLowerCase()}`;
    if (options?.tokenId) {
        basePath = `${basePath}/${options?.tokenId}`;
    }
    const chainId = options?.chainId || ChainId.Mainnet;
    return urlcat(`${basePath}/:chainId`, {
        chainId,
    });
}
