import { isValidChainId as isValidSolanaChainId } from '@masknet/web3-shared-solana';

import { EVMExplorerResolver, SolanaExplorerResolver } from '@/mask/index.js';

export function resolveAddressLink(chainId: number, address: string) {
    if (isValidSolanaChainId(chainId)) {
        return SolanaExplorerResolver.addressLink(chainId, address);
    }

    return EVMExplorerResolver.addressLink(chainId, address);
}
