/* cspell:disable */

'use client';

import {
    type AppKitNetwork,
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
} from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import {
    arbitrum as wagmiArbitrum,
    aurora as wagmiAurora,
    avalanche as wagmiAvalanche,
    base as wagmiBase,
    bsc as wagmiBsc,
    confluxESpace as wagmiConfluxESpace,
    degen as wagmiDegen,
    fantom as wagmiFantom,
    gnosis as wagmiGnosis,
    mainnet as wagmiMainnet,
    metis as wagmiMetis,
    optimism as wagmiOptimism,
    polygon as wagmiPolygon,
    xLayer as wagmiXLayer,
    zora as wagmiZora,
} from 'wagmi/chains';

import { env } from '@/constants/env.js';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/constants/index.js';

const networks = [
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
] as [AppKitNetwork, ...AppKitNetwork[]];

export const chains = [
    wagmiMainnet,
    wagmiBase,
    wagmiBsc,
    wagmiDegen,
    wagmiPolygon,
    wagmiOptimism,
    wagmiArbitrum,
    wagmiGnosis,
    wagmiAvalanche,
    wagmiAurora,
    wagmiConfluxESpace,
    wagmiFantom,
    wagmiXLayer,
    wagmiMetis,
    wagmiZora,
] as const;

export const adapter = new WagmiAdapter({
    networks,
    connectors: [],
    projectId: env.external.NEXT_PUBLIC_W3M_PROJECT_ID,
});

const metadata = {
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    icons: ['/image/firefly-light-avatar.png'],
};
createAppKit({
    adapters: [adapter],
    networks,
    metadata,
    projectId: env.external.NEXT_PUBLIC_W3M_PROJECT_ID,
    showWallets: false,
    features: {
        email: false,
        socials: [],
    },
});

export const config = adapter.wagmiConfig;
