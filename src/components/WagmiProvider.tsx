'use client';

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';

import { WagmiConfig } from 'wagmi';
import { arbitrum, mainnet } from 'wagmi/chains';

const projectId = '96dedca58ca659e9cdb953fe0e079be6';

const metadata = {
    name: 'mask.social',
    description: 'Mask Network Social Website',
    url: 'https://mask.social',
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const chains = [mainnet, arbitrum];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({ wagmiConfig, projectId, chains });

export interface WagmiProps {
    children: React.ReactNode;
}

export function WagmiProvider(props: WagmiProps) {
    return <WagmiConfig config={wagmiConfig}>{props.children}</WagmiConfig>;
}
