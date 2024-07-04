'use client';

import '@solana/wallet-adapter-react-ui/styles.css';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { type PropsWithChildren } from 'react';

import { env } from '@/constants/env.js';
import { SOLANA_WALLET_CACHE_KEY } from '@/constants/index.js';

const wallets = [new UnsafeBurnerWalletAdapter()];

export function SolanaWalletAdapterProvider({ children }: PropsWithChildren) {
    return (
        <ConnectionProvider endpoint={env.external.NEXT_PUBLIC_SOLANA_RPC_URL}>
            <WalletProvider wallets={wallets} autoConnect localStorageKey={SOLANA_WALLET_CACHE_KEY}>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
