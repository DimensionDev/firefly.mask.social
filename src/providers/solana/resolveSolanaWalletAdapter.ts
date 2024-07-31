/* cspell:disable */

import { createLookupTableResolver } from '@masknet/shared-base';
import { type SignerWalletAdapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { CoinbaseWalletAdapter, CoinbaseWalletName } from '@solana/wallet-adapter-coinbase';
import { PhantomWalletAdapter, PhantomWalletName } from '@solana/wallet-adapter-phantom';
import { WalletConnectWalletAdapter, WalletConnectWalletName } from '@solana/wallet-adapter-walletconnect';

import { env } from '@/constants/env.js';
import { UnreachableError } from '@/constants/error.js';

export const resolveSolanaWalletAdapter = createLookupTableResolver(
    {
        [PhantomWalletName]: new PhantomWalletAdapter(),
        [CoinbaseWalletName]: new CoinbaseWalletAdapter(),
        [WalletConnectWalletName]: new WalletConnectWalletAdapter({
            options: {
                projectId: env.external.NEXT_PUBLIC_W3M_PROJECT_ID,
            },
            network: WalletAdapterNetwork.Mainnet,
        }),
    } as unknown as Record<string, SignerWalletAdapter>,
    (walletName: string) => {
        throw new UnreachableError('Solana wallet', walletName);
    },
);
