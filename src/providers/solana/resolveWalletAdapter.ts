import { WalletNotConnectedError } from '@solana/wallet-adapter-base';

import { SOLANA_WALLET_CACHE_KEY } from '@/constants/index.js';
import { parseJSON } from '@/helpers/parseJSON.js';
import { resolveSolanaWalletAdapter } from '@/providers/solana/resolveSolanaWalletAdapter.js';

export function resolveWalletAdapter() {
    const currentName = parseJSON<string>(localStorage.getItem(SOLANA_WALLET_CACHE_KEY));
    if (!currentName) {
        throw new WalletNotConnectedError();
    }
    const adapter = resolveSolanaWalletAdapter(currentName);

    if (!adapter) {
        throw new WalletNotConnectedError();
    }

    return adapter;
}
