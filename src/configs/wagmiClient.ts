/* cspell:disable */

'use client';

import { safeUnreachable } from '@masknet/kit';
import { type Chain, connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
    coinbaseWallet,
    metaMaskWallet,
    okxWallet,
    rabbyWallet,
    walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
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

import { WalletProviderType } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { UnreachableError } from '@/constants/error.js';
import { SITE_DESCRIPTION, SITE_HOSTNAME, SITE_NAME, SITE_URL } from '@/constants/index.js';
import { resolveRPCUrl } from '@/helpers/resolveRPCUrl.js';
import { settings } from '@/settings/index.js';

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

// find the wallet id at https://explorer.walletconnect.com/
enum WalletId {
    Phantom = 'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393',
}

function createWagmiConfig(): Config {
    const type = settings.WALLET_PROVIDER_TYPE;

    switch (type) {
        case WalletProviderType.AppKit:
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
                excludeWalletIds: [WalletId.Phantom],
                enableSwaps: false,
                enableOnramp: false,
                enableAnalytics: false, // Optional - defaults to your Cloud configuration
            });
            return config;

        case WalletProviderType.RainbowKit:
            return createConfig({
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
        default:
            safeUnreachable(type);
            throw new UnreachableError('wallet provider', type);
    }
}

export const config = createWagmiConfig();
