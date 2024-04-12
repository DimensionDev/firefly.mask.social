/* cspell:disable */

'use client';

import { type Chain, getDefaultConfig, type Wallet } from '@rainbow-me/rainbowkit';
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

export const wallets = [
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
] as const satisfies Wallet[];

export const config = getDefaultConfig({
    appName: SITE_HOSTNAME,
    projectId: process.env.NEXT_PUBLIC_W3M_PROJECT_ID,
    chains,
    wallets,
}) as Config;
