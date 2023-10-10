'use client';

import { ConnectWallet } from '@/components/ConnectWallet';
import { SignMessage } from '@/components/SignMessage';
import { WagmiProvider } from '@/components/WagmiProvider';
import { useMounted } from '@/hooks/useMounted';

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
