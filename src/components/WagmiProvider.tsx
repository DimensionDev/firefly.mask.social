/* cspell:disable */

'use client';

import { useAppKitAccount, useWalletInfo } from '@reown/appkit/react';
import { useEffect } from 'react';
import { isAddress } from 'viem';
import { WagmiProvider as WagmiProviderSDK } from 'wagmi';

import { config } from '@/configs/wagmiClient.js';
import { captureConnectWalletEvent } from '@/providers/telemetry/captureConnectWalletEvent.js';
import { EventId } from '@/providers/types/Telemetry.js';

interface WagmiProviderProps {
    children: React.ReactNode;
}

export function WagmiProvider(props: WagmiProviderProps) {
    return (
        <WagmiProviderSDK config={config}>
            {props.children}
            <Insights />
        </WagmiProviderSDK>
    );
}

function resolveEventId(name_: string) {
    const name = name_.toLowerCase();

    if (name.includes('metamask')) return EventId.CONNECT_WALLET_SUCCESS_METAMASK;
    if (name.includes('rabby')) return EventId.CONNECT_WALLET_SUCCESS_RABBY;
    if (name.includes('wallet connect') || name.includes('walletconnect'))
        return EventId.CONNECT_WALLET_SUCCESS_WALLET_CONNECT;
    if (name.includes('binance')) return EventId.CONNECT_WALLET_SUCCESS_BINANCE;
    if (name.includes('okx')) return EventId.CONNECT_WALLET_SUCCESS_OKX;
    if (name.includes('zerion')) return EventId.CONNECT_WALLET_SUCCESS_ZERION;
    if (name.includes('rainbow')) return EventId.CONNECT_WALLET_SUCCESS_RAINBOW;
    if (name.includes('coinbase')) return EventId.CONNECT_WALLET_SUCCESS_COINBASE;
    if (name.includes('phantom')) return EventId.CONNECT_WALLET_SUCCESS_PHANTOM;
    if (name.includes('firefly')) return EventId.CONNECT_WALLET_SUCCESS_PARTICLE;

    return EventId.CONNECT_WALLET_SUCCESS;
}

function Insights() {
    const account = useAppKitAccount();
    const wallet = useWalletInfo();
    const walletAddress = account.address?.toLowerCase();
    const walletName = wallet.walletInfo?.name?.toLowerCase() ?? 'unknown';

    useEffect(() => {
        if (!walletAddress || !isAddress(walletAddress)) return;

        captureConnectWalletEvent(resolveEventId(walletName), {
            name: walletName,
            evmAddress: walletAddress,
        });
    }, [walletAddress, walletName]);

    return null;
}
