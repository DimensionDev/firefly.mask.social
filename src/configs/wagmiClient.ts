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

const particleConnector = createParticleConnector({});

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
    featuredWalletIds: IS_MOBILE_DEVICE
        ? [
              'network.particle', // Firefly Wallet,
              'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
              '18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1', // Rabby
              '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX Wallet
          ]
        : [
              'network.particle', // Firefly Wallet,
              'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
              '18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1', // Rabby
              '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX Wallet
          ],
});

export const config = adapter.wagmiConfig;
