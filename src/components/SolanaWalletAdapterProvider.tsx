'use client';

import '@solana/wallet-adapter-react-ui/styles.css';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { type PropsWithChildren } from 'react';

export function SolanaWalletAdapterProvider({ children }: PropsWithChildren) {
    const endpoint = clusterApiUrl(WalletAdapterNetwork.Mainnet);
    const wallets = [new UnsafeBurnerWalletAdapter()];

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
