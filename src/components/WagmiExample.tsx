'use client';

import { ConnectWallet } from '@/components/ConnectWallet.js';
import { SignMessage } from '@/components/SignMessage.js';
import { WagmiProvider } from '@/components/WagmiProvider.js';
import { useMounted } from '@/hooks/useMounted.js';

export function WagmiExample() {
    const mounted = useMounted();
    if (!mounted) return null;

    return (
        <WagmiProvider>
            <ConnectWallet />
            <SignMessage />
        </WagmiProvider>
    );
}
