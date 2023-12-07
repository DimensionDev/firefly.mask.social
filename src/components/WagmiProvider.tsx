'use client';

import '@rainbow-me/rainbowkit/styles.css';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { polygon } from 'viem/chains';
import { WagmiConfig } from 'wagmi';

import { appInfo, chains, config } from '@/configs/wagmiClient.js';

export interface WagmiProviderProps {
    children: React.ReactNode;
}

export function WagmiProvider(props: WagmiProviderProps) {
    return (
        <WagmiConfig config={config}>
            <RainbowKitProvider chains={chains} initialChain={polygon} appInfo={appInfo} showRecentTransactions>
                {props.children}
            </RainbowKitProvider>
        </WagmiConfig>
    );
}
