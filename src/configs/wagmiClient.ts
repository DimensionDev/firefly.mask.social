'use client';

import { connectorsForWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { coinbaseWallet, metaMaskWallet, rabbyWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { type FallbackTransport } from 'viem';
import { type Config, configureChains, createConfig, type PublicClient, type WebSocketPublicClient } from 'wagmi';
import {
    arbitrum,
    aurora,
    avalanche,
    base,
    bsc,
    type Chain,
    confluxESpace,
    fantom,
    gnosis,
    mainnet,
    optimism,
    polygon,
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

import { SITE_HOSTNAME, SITE_URL } from '@/constants/index.js';

export const appInfo: Parameters<typeof RainbowKitProvider>[0]['appInfo'] = {
    appName: SITE_HOSTNAME,
    learnMoreUrl: SITE_URL,
};

const x1test = {
    id: 195,
    name: 'X1 Testnet',
    nativeCurrency: {
        name: 'OKB',
        symbol: 'OKB',
        decimals: 18,
    },
    rpcUrls: {
        default: { http: ['https://testrpc.x1.tech'] },
        public: { http: ['https://testrpc.x1.tech'] },
    },
    network: 'X1Test',
} as const satisfies Chain;

export const { chains, publicClient, webSocketPublicClient } = configureChains(
    [mainnet, base, polygon, optimism, bsc, arbitrum, gnosis, avalanche, aurora, confluxESpace, fantom, x1test],
    [publicProvider()],
) as {
    readonly chains: Chain[];
    readonly publicClient: (options: { chainId?: number | undefined }) => PublicClient<FallbackTransport>;
    readonly webSocketPublicClient: (options: {
        chainId?: number | undefined;
    }) => WebSocketPublicClient<FallbackTransport> | undefined;
};

export const connectors = connectorsForWallets([
    {
        groupName: 'Recommended',
        wallets: [
            metaMaskWallet({
                projectId: process.env.NEXT_PUBLIC_W3M_PROJECT_ID,
                chains,
            }),
            walletConnectWallet({
                projectId: process.env.NEXT_PUBLIC_W3M_PROJECT_ID,
                chains,
            }),
            coinbaseWallet({
                appName: SITE_HOSTNAME,
                chains,
            }),
            rabbyWallet({
                name: SITE_HOSTNAME,
                chains,
            }),
        ],
    },
]);

export const config = createConfig({
    autoConnect: process.env.NODE_ENV !== 'test',
    connectors,
    publicClient,
    webSocketPublicClient,
}) as Config;
