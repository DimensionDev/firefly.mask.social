/* cspell:disable */

'use client';

import { t } from '@lingui/macro';
import { type Chain, connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
    coinbaseWallet,
    metaMaskWallet,
    okxWallet,
    rabbyWallet,
    walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createClient, http } from 'viem';
import { type Config, createConfig } from 'wagmi';
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
    x1Testnet,
} from 'wagmi/chains';

import { SITE_HOSTNAME } from '@/constants/index.js';

export const chains = [
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
    x1Testnet,
    metis,
] as const satisfies Chain[];

export const connectors = connectorsForWallets(
    [
        {
            groupName: t`Recommended`,
            wallets: [
                metaMaskWallet,
                walletConnectWallet,
                coinbaseWallet,
                rabbyWallet,
                okxWallet,
            ],
        },
    ],
    {
        projectId: process.env.NEXT_PUBLIC_W3M_PROJECT_ID,
        appName: SITE_HOSTNAME,
    },
);

export const config = createConfig({
    chains,
    connectors,
    client({ chain }) {
        return createClient({ chain, transport: http() });
    },
}) as Config;
