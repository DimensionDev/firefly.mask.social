import type { NonFungibleAsset } from '@masknet/web3-shared-base';
import { isValidChainId as isValidSolanaChainId } from '@masknet/web3-shared-solana';

import { resolveSimpleHashChain } from '@/helpers/resolveSimpleHashChain.js';

export function resolveNFTId(chainId: number, address: string, tokenId: string) {
    if (isValidSolanaChainId(chainId)) {
        return `solana.${address}`;
    }

    const chain = resolveSimpleHashChain(chainId) || 'ethereum';
    return `${chain}.${address}.${tokenId}`;
}

export function resolveNFTIdFromAsset(asset: NonFungibleAsset<number, number>) {
    return resolveNFTId(asset.chainId, asset.address, asset.tokenId);
}
