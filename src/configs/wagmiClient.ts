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
import { createClient, http } from 'viem';
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
    xLayer,
    zora,
} from 'wagmi/chains';

import { env } from '@/constants/env.js';
import { SITE_DESCRIPTION, SITE_HOSTNAME, SITE_NAME, SITE_URL } from '@/constants/index.js';
import { resolveRPCUrl } from '@/helpers/resolveRPCUrl.js';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';

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

const metadata = {
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    icons: ['/image/firefly-light-avatar.png'],
};

const wagmiConfig =
    env.external.NEXT_PUBLIC_WALLET_PROVIDER === 'appkit'
        ? defaultWagmiConfig({
              chains,
              metadata,
              projectId: env.external.NEXT_PUBLIC_W3M_PROJECT_ID,
          })
        : createConfig({
            chains,
            connectors: connectorsForWallets(
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
            ),
            client({ chain }) {
                return createClient({
                    chain,
                    transport: http(resolveRPCUrl(chain.id), {
                        batch: true,
                    }),
                });
            },
        });

if (env.external.NEXT_PUBLIC_WALLET_PROVIDER === 'appkit') {
    createWeb3Modal({
        metadata,
        wagmiConfig,
        projectId: env.external.NEXT_PUBLIC_W3M_PROJECT_ID,
        enableAnalytics: false, // Optional - defaults to your Cloud configuration
    });
}

export const config = wagmiConfig as Config; 
