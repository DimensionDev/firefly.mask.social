/* cspell:disable */

'use client';

import '@solana/wallet-adapter-react-ui/styles.css';

import { type Adapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect';
import { type PropsWithChildren, useEffect } from 'react';

import { ParticleSolanaWalletAdapter } from '@/connectors/ParticleSolanaWallet.js';
import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { SOLANA_WALLET_CACHE_KEY } from '@/constants/index.js';
import { isValidSolanaAddress } from '@/helpers/isValidSolanaAddress.js';
import { captureConnectWalletEvent } from '@/providers/telemetry/captureConnectWalletEvent.js';
import { EventId } from '@/providers/types/Telemetry.js';

const wallets: Adapter[] = [
    env.external.NEXT_PUBLIC_PARTICLE === STATUS.Enabled ? new ParticleSolanaWalletAdapter() : null,
    new PhantomWalletAdapter(),
    new WalletConnectWalletAdapter({
        options: {
            projectId: env.external.NEXT_PUBLIC_W3M_PROJECT_ID,
        },
        network: WalletAdapterNetwork.Mainnet,
    }),
].filter((x) => !!x);

export function SolanaWalletAdapterProvider({ children }: PropsWithChildren) {
    return (
        <ConnectionProvider endpoint={env.external.NEXT_PUBLIC_SOLANA_RPC_URL}>
            <WalletProvider wallets={wallets} autoConnect localStorageKey={SOLANA_WALLET_CACHE_KEY}>
                <WalletModalProvider>
                    {children}
                    <Insights />
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

function resolveEventId(name_: string) {
    const name = name_.toLowerCase();

    if (name.includes('phantom')) return EventId.CONNECT_WALLET_SUCCESS_PHANTOM;
    if (name.includes('okx')) return EventId.CONNECT_WALLET_SUCCESS_OKX;
    if (name.includes('firefly')) return EventId.CONNECT_WALLET_SUCCESS_PARTICLE;
    if (name.includes('wallet connect') || name.includes('walletconnect'))
        return EventId.CONNECT_WALLET_SUCCESS_WALLET_CONNECT;

    return EventId.CONNECT_WALLET_SUCCESS;
}

function Insights() {
    const wallet = useWallet();
    const walletAddress = wallet.publicKey?.toBase58().toLowerCase();
    const walletName = wallet.wallet?.adapter.name.__brand__ ?? 'unknown';

    useEffect(() => {
        if (!isValidSolanaAddress(walletAddress)) return;

        captureConnectWalletEvent(resolveEventId(walletName), {
            name: walletName,
            solanaAddress: walletAddress,
        });
    }, [walletAddress, walletName]);

    return null;
}
