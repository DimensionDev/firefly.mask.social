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

import { createParticleConnector } from '@/connectors/ParticleConnector.js';
import { IS_MOBILE_DEVICE } from '@/constants/bowser.js';
import { env } from '@/constants/env.js';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/constants/index.js';
import { WalletId } from '@/constants/reown.js';

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

export const particleConnector = createParticleConnector({
    chains,
});

export const adapter = new WagmiAdapter({
    projectId: env.external.NEXT_PUBLIC_W3M_PROJECT_ID,
    connectors: particleConnector ? [particleConnector] : [],
    networks,
});

const metadata = {
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    icons: ['/image/firefly-light-avatar.png'],
};

const walletIds = IS_MOBILE_DEVICE
    ? [WalletId.MetaMask, WalletId.Rabby, WalletId.OKX]
    : [WalletId.CoinBase, WalletId.Rabby, WalletId.OKX];

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
    debug: true,
    includeWalletIds: walletIds,
    featuredWalletIds: walletIds,
});

export const config = adapter.wagmiConfig;
