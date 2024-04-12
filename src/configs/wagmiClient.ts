/* cspell:disable */

'use client';

import { type Chain, getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import {
    coinbaseWallet,
    metaMaskWallet,
    okxWallet,
    rabbyWallet,
    walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { type Config } from 'wagmi';
import {
    arbitrum,
    aurora,
    avalanche,
    base,
    bsc,
    confluxESpace,
    fantom,
    gnosis,
    mainnet,
    metis,
    optimism,
    polygon,
} from 'wagmi/chains';

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
} as const satisfies Chain;

const chains = [
    mainnet,
    base,
    polygon,
    optimism,
    bsc,
    arbitrum,
    gnosis,
    avalanche,
    aurora,
    confluxESpace,
    fantom,
    x1test,
    metis,
] as const satisfies Chain[];

export const config = getDefaultConfig({
    appName: SITE_HOSTNAME,
    projectId: process.env.NEXT_PUBLIC_W3M_PROJECT_ID,
    chains,
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
        okxWallet({
            projectId: process.env.NEXT_PUBLIC_W3M_PROJECT_ID,
            chains,
        }),
    ],
}) as Config;
