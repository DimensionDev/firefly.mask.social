/* cspell:disable */

'use client';

import { type Chain, connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
    coinbaseWallet,
    metaMaskWallet,
    okxWallet,
    rabbyWallet,
    walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createClient, defineChain, http } from 'viem';
import { type Config, createConfig } from 'wagmi';
import {
    arbitrum,
    aurora,
    avalanche,
    base,
    baseSepolia,
    bsc,
    confluxESpace,
    degen,
    fantom,
    gnosis,
    mainnet,
    metis,
    optimism,
    polygon,
    zora,
} from 'wagmi/chains';

import { env } from '@/constants/env.js';
import { SITE_HOSTNAME } from '@/constants/index.js';

const XLayer = defineChain({
    id: 196,
    name: 'X Layer',
    nativeCurrency: {
        decimals: 18,
        name: 'OKB',
        symbol: 'OKB',
    },
    rpcUrls: {
        default: { http: ['https://rpc.xlayer.tech'] },
    },
    blockExplorers: {
        default: {
            name: 'X Layer explorer',
            url: 'https://www.okx.com/explorer/xlayer',
        },
    },
    contracts: {
        multicall3: {
            address: '0x8A42F70047a99298822dD1dbA34b454fc49913F2',
            blockCreated: 67224,
        },
    },
});

export const chains = [
    mainnet,
    base,
    bsc,
    degen,
    polygon,
    optimism,
    arbitrum,
    gnosis,
    avalanche,
    aurora,
    confluxESpace,
    fantom,
    XLayer,
    metis,
    zora,
] as const satisfies Chain[];

export const connectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: [metaMaskWallet, walletConnectWallet, coinbaseWallet, rabbyWallet, okxWallet],
        },
    ],
    {
        projectId: env.external.NEXT_PUBLIC_W3M_PROJECT_ID,
        appName: SITE_HOSTNAME,
    },
);

export const config = createConfig({
    chains,
    connectors,
    client({ chain }) {
        return createClient({
            chain,
            transport: http(undefined, {
                batch: true,
            }),
        });
    },
}) as Config;
