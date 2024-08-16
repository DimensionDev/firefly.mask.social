'use client';

import '@rainbow-me/rainbowkit/styles.css';

import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { useMemo } from 'react';
import { polygon } from 'viem/chains';
import { WagmiConfig } from 'wagmi';

import { config } from '@/configs/wagmiClient.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
import { resolveRainbowKitLocale } from '@/helpers/resolveRainbowKitLocale.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

interface WagmiProviderProps {
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
                locale={resolveRainbowKitLocale(getLocaleFromCookies())}
                theme={theme}
                initialChain={polygon}
                showRecentTransactions
            >
                {props.children}
            </RainbowKitProvider>
        </WagmiConfig>
    );
}
