'use client';

import '@solana/wallet-adapter-react-ui/styles.css';

import { type Adapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
    CoinbaseWalletAdapter,
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    WalletConnectWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { type PropsWithChildren } from 'react';

import { env } from '@/constants/env.js';

const wallets: Adapter[] = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new CoinbaseWalletAdapter(),
    new WalletConnectWalletAdapter({
        options: {
            projectId: env.external.NEXT_PUBLIC_W3M_PROJECT_ID,
        },
        network: WalletAdapterNetwork.Mainnet,
    }),
];

export function SolanaWalletAdapterProvider({ children }: PropsWithChildren) {
    return (
        <ConnectionProvider endpoint={env.external.NEXT_PUBLIC_SOLANA_RPC_URL}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
