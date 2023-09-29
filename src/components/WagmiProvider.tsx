'use client';

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';

import { WagmiConfig } from 'wagmi';
import { arbitrum, mainnet } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_W3M_PROJECT_ID;

const metadata = {
    name: 'mask.social',
    description: 'Mask Network Social Website',
    url: 'https://mask.social',
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const chains = [mainnet, arbitrum];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({ wagmiConfig, projectId, chains });

export interface WagmiProviderProps {
    children: React.ReactNode;
}

export function WagmiProvider(props: WagmiProviderProps) {
    return <WagmiConfig config={wagmiConfig}>{props.children}</WagmiConfig>;
}
