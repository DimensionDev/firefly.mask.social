'use client';

import '@solana/wallet-adapter-react-ui/styles.css';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { type PropsWithChildren } from 'react';

import { env } from '@/constants/env.js';

export function SolanaWalletAdapterProvider({ children }: PropsWithChildren) {
    const endpoint = env.external.NEXT_PUBLIC_SOLANA_RPC_URL;
    const wallets = [new UnsafeBurnerWalletAdapter()];

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
