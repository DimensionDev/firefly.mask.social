/* cspell:disable */

'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { type Config } from 'wagmi';
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
    xLayer,
    zora,
} from 'wagmi/chains';

import { env } from '@/constants/env.js';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/constants/index.js';

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
] as const;

function createWagmiConfig(): Config {
    const metadata = {
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        icons: ['/image/firefly-light-avatar.png'],
    };

    const config = defaultWagmiConfig({
        auth: {
            email: false,
        },
        chains,
        metadata,
        projectId: env.external.NEXT_PUBLIC_W3M_PROJECT_ID,
    });

    createWeb3Modal({
        metadata,
        wagmiConfig: config,
        projectId: env.external.NEXT_PUBLIC_W3M_PROJECT_ID,
        enableSwaps: false,
        enableOnramp: false,
        enableAnalytics: false, // Optional - defaults to your Cloud configuration
    });
    return config;
}

export const config = createWagmiConfig();
