'use client';

import '@rainbow-me/rainbowkit/styles.css';

import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { appInfo, chains, config } from '@/configs/wagmi.js';

export interface WagmiProviderProps {
    children: React.ReactNode;
}

export function WagmiProvider(props: WagmiProviderProps) {
    return (
        <WagmiConfig config={config}>
            <RainbowKitProvider chains={chains} appInfo={appInfo} showRecentTransactions>
                {props.children}
            </RainbowKitProvider>
        </WagmiConfig>
    );
}
