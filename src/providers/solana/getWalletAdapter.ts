/* cspell:disable */

import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { type SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { CoinbaseWalletAdapter, CoinbaseWalletName } from '@solana/wallet-adapter-coinbase';
import { PhantomWalletAdapter, PhantomWalletName } from '@solana/wallet-adapter-phantom';
import type { PublicKey } from '@solana/web3.js';

import { UnreachableError } from '@/constants/error.js';
import { SOLANA_WALLET_CACHE_KEY } from '@/constants/index.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { parseJSON } from '@/helpers/parseJSON.js';

const resolveSolanaWalletAdapter = createLookupTableResolver(
    {
        [PhantomWalletName]: new PhantomWalletAdapter(),
        [CoinbaseWalletName]: new CoinbaseWalletAdapter(),
    } as unknown as Record<string, SignerWalletAdapter>,
    (walletName: string) => {
        throw new UnreachableError('Solana wallet', walletName);
    },
);

export function getWalletAdapter() {
    const currentName = parseJSON<string>(localStorage.getItem(SOLANA_WALLET_CACHE_KEY));
    if (!currentName) throw new WalletNotConnectedError();

    const adapter = resolveSolanaWalletAdapter(currentName);
    if (!adapter) throw new WalletNotConnectedError();

    return adapter;
}

export function getWalletAdaptorConnected() {
    const adaptor = getWalletAdapter();
    if (!adaptor.publicKey) throw new WalletNotConnectedError();

    return adaptor as SignerWalletAdapter & { publicKey: PublicKey };
}
