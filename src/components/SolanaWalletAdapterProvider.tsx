/* cspell:disable */

'use client';

import '@solana/wallet-adapter-react-ui/styles.css';

import { type Adapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect';
import { type PropsWithChildren } from 'react';

import { ParticleSolanaWalletAdapter } from '@/connectors/ParticleSolanaWallet.js';
import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { SOLANA_WALLET_CACHE_KEY } from '@/constants/index.js';

const wallets: Adapter[] = [
    env.external.NEXT_PUBLIC_PARTICLE === STATUS.Enabled ? new ParticleSolanaWalletAdapter() : null,
    new PhantomWalletAdapter(),
    new WalletConnectWalletAdapter({
        options: {
            projectId: env.external.NEXT_PUBLIC_W3M_PROJECT_ID,
        },
        network: WalletAdapterNetwork.Mainnet,
    }),
].filter((x) => !!x);

export function SolanaWalletAdapterProvider({ children }: PropsWithChildren) {
    return (
        <ConnectionProvider endpoint={env.external.NEXT_PUBLIC_SOLANA_RPC_URL}>
            <WalletProvider wallets={wallets} autoConnect localStorageKey={SOLANA_WALLET_CACHE_KEY}>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
