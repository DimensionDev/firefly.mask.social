'use client';

import '@rainbow-me/rainbowkit/styles.css';

import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { useMemo } from 'react';
import { polygon } from 'viem/chains';
import { WagmiConfig } from 'wagmi';

import { appInfo, chains, config } from '@/configs/wagmiClient.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

export interface WagmiProviderProps {
    children: React.ReactNode;
}

export function WagmiProvider(props: WagmiProviderProps) {
    const { isDarkMode } = useDarkMode();
    const theme = useMemo(() => {
        return isDarkMode ? darkTheme() : undefined;
    }, [isDarkMode]);
    return (
        <WagmiConfig config={config}>
            <RainbowKitProvider
                theme={theme}
                chains={chains}
                initialChain={polygon}
                appInfo={appInfo}
                showRecentTransactions
            >
                {props.children}
            </RainbowKitProvider>
        </WagmiConfig>
    );
}
