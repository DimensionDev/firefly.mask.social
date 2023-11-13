'use client';

import { configureChains, createConfig, type Config, type PublicClient, type WebSocketPublicClient } from 'wagmi';
import { arbitrum, mainnet, polygon, type Chain } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { RainbowKitProvider, connectorsForWallets, getDefaultWallets } from '@rainbow-me/rainbowkit';
import type { FallbackTransport } from 'viem';

export const appInfo: Parameters<typeof RainbowKitProvider>[0]['appInfo'] = {
    appName: 'mask.social',
    learnMoreUrl: 'https://mask.social',
};

export const { chains, publicClient, webSocketPublicClient } = configureChains(
    [mainnet, polygon, arbitrum],
    [publicProvider()],
) as {
    readonly chains: Chain[];
    readonly publicClient: (options: { chainId?: number | undefined }) => PublicClient<FallbackTransport>;
    readonly webSocketPublicClient: (options: {
        chainId?: number | undefined;
    }) => WebSocketPublicClient<FallbackTransport> | undefined;
};

const { wallets } = getDefaultWallets({
    appName: 'mask.social',
    projectId: process.env.NEXT_PUBLIC_W3M_PROJECT_ID,
    chains,
});

export const connectors = connectorsForWallets([...wallets]);

export const config = createConfig({
    autoConnect: process.env.NODE_ENV !== 'test',
    connectors,
    publicClient,
    webSocketPublicClient,
}) as Config;
