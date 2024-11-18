import { EVMExplorerResolver } from '@masknet/web3-providers';
import { isValidChainId as isValidSolanaChainId } from '@masknet/web3-shared-solana';

// eslint-disable-next-line no-restricted-imports
import { SolanaExplorerResolver } from '@/maskbook/packages/web3-providers/src/Web3/Solana/apis/ResolverAPI.js';

export function resolveAddressLink(chainId: number, address: string) {
    if (isValidSolanaChainId(chainId)) {
        return SolanaExplorerResolver.addressLink(chainId, address);
    }

    return EVMExplorerResolver.addressLink(chainId, address);
}
