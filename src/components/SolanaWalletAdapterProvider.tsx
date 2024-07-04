'use client';

import '@solana/wallet-adapter-react-ui/styles.css';

import type { Adapter } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { type PropsWithChildren } from 'react';

import { env } from '@/constants/env.js';

const wallets: Adapter[] = [];

export function SolanaWalletAdapterProvider({ children }: PropsWithChildren) {
    return (
        <ConnectionProvider endpoint={env.external.NEXT_PUBLIC_SOLANA_RPC_URL}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
