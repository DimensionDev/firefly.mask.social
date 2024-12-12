/* cspell:disable */

import { type SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { CoinbaseWalletAdapter, CoinbaseWalletName } from '@solana/wallet-adapter-coinbase';
import { PhantomWalletAdapter, PhantomWalletName } from '@solana/wallet-adapter-phantom';

import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';

export const resolveSolanaWalletAdapter = createLookupTableResolver(
    {
        [PhantomWalletName]: new PhantomWalletAdapter(),
        [CoinbaseWalletName]: new CoinbaseWalletAdapter(),
    } as unknown as Record<string, SignerWalletAdapter>,
    (walletName: string) => {
        throw new UnreachableError('Solana wallet', walletName);
    },
);
