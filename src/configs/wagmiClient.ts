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
    xLayer,
} from 'wagmi/chains';

import { env } from '@/constants/env.js';
import { SITE_HOSTNAME } from '@/constants/index.js';
import { resolveRPCUrl } from '@/helpers/resolveRPCUrl.js';

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
    xLayer,
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
            transport: http(resolveRPCUrl(chain.id), {
                batch: true,
            }),
        });
    },
}) as Config;
