import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-wallets';

import { SOLANA_WALLET_CACHE_KEY } from '@/constants/index.js';
import { parseJSON } from '@/helpers/parseJSON.js';
import { resolveSolanaWalletAdapter } from '@/providers/solana/resolveSolanaWalletAdapter.js';

let walletName: string;
let adapter: CoinbaseWalletAdapter | null = null;

export function resolveWalletAdapter() {
    const currentName = parseJSON<string>(localStorage.getItem(SOLANA_WALLET_CACHE_KEY));
    if (!adapter || (walletName && currentName && walletName !== currentName)) {
        const NewAdapter = resolveSolanaWalletAdapter(currentName!);
        if (NewAdapter) {
            adapter = new NewAdapter();
            walletName = currentName!;
        } else {
            adapter = null;
            walletName = '';
        }
    }

    if (!currentName) {
        adapter = null;
        walletName = '';
    }

    if (!adapter) {
        throw new WalletNotConnectedError();
    }

    return adapter;
}
