'use client';

import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { WagmiProvider as WagmiProviderSKD } from 'wagmi';

import { config } from '@/configs/wagmiClient.js';

const dynamicContextSettings = {
    environmentId: 'e5ef3896-0c03-42da-9f38-84c3cf258493',
    walletConnectors: [EthereumWalletConnectors],
};

export interface WagmiProviderProps {
    children: React.ReactNode;
}

export function WagmiProvider(props: WagmiProviderProps) {
    return (
        <DynamicContextProvider settings={dynamicContextSettings}>
            <WagmiProviderSKD config={config}>
                <DynamicWagmiConnector>{props.children}</DynamicWagmiConnector>
            </WagmiProviderSKD>
        </DynamicContextProvider>
    );
}
