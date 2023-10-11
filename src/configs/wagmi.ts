'use client';

import { connectorsForWallets, getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { configureChains, createConfig } from 'wagmi';
import { arbitrum, mainnet, polygon } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

export const appInfo: Parameters<typeof RainbowKitProvider>[0]['appInfo'] = {
    appName: 'mask.social',
    learnMoreUrl: 'https://mask.social',
};

export const { chains, publicClient, webSocketPublicClient } = configureChains(
    [mainnet, polygon, arbitrum],
    [publicProvider()],
);

const { wallets } = getDefaultWallets({
    appName: 'mask.social',
    projectId: process.env.NEXT_PUBLIC_W3M_PROJECT_ID,
    chains,
});

export const connectors = connectorsForWallets([...wallets]);

export const config = createConfig({
    autoConnect: process.env.NODE_ENV === 'test',
    connectors,
    publicClient,
    webSocketPublicClient,
});
