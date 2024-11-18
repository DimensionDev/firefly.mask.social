import { isValidChainId as isValidSolanaChainId } from '@masknet/web3-shared-solana';

import { SimpleHashEVMWalletProfileProvider } from '@/providers/simplehash/EVMWalletProfile.js';
import { SimpleHashSolanaWalletProfileProvider } from '@/providers/simplehash/SolanaWalletProfile.js';
import type { Provider } from '@/providers/types/WalletProfile.js';

export function resolveWalletProfileProvider(chainId?: number): Provider<number, number> {
    if (chainId && isValidSolanaChainId(chainId)) {
        return SimpleHashSolanaWalletProfileProvider;
    }

    return SimpleHashEVMWalletProfileProvider;
}
