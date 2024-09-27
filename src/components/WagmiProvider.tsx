'use client';

import { WagmiConfig } from 'wagmi';

import { config } from '@/configs/wagmiClient.js';

interface WagmiProviderProps {
    children: React.ReactNode;
}

export function WagmiProvider(props: WagmiProviderProps) {
    return <WagmiConfig config={config}>{props.children}</WagmiConfig>;
}
