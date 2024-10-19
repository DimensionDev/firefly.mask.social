'use client';

import { WagmiProvider as WagmiProviderSDK } from 'wagmi';

import { config } from '@/configs/wagmiClient.js';

interface WagmiProviderProps {
    children: React.ReactNode;
}

export function WagmiProvider(props: WagmiProviderProps) {
    return <WagmiProviderSDK config={config}>{props.children}</WagmiProviderSDK>;
}
