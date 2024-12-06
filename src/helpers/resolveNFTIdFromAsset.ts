import type { NonFungibleAsset } from '@masknet/web3-shared-base';
import { isValidChainId as isValidSolanaChainId } from '@masknet/web3-shared-solana';

import { resolveSimpleHashChain } from '@/helpers/resolveSimpleHashChain.js';

export function resolveNFTIdFromAsset(asset: NonFungibleAsset<number, number>) {
    if (isValidSolanaChainId(asset.chainId)) {
        return `solana.${asset.address}`;
    }

    const chain = resolveSimpleHashChain(asset.chainId) || 'ethereum';
    return `${chain}.${asset.address}.${asset.tokenId}`;
}
