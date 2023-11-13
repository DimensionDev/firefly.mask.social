'use client';

import { ConnectWallet } from '@/components/ConnectWallet';
import { SignMessage } from '@/components/SignMessage';
import { WagmiProvider } from '@/components/WagmiProvider';
import { useMounted } from '@/hooks/useMounted';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';

export function WagmiExample() {
    const mounted = useMounted();
    const addRecentTransaction = useAddRecentTransaction();
    if (!mounted) return null;

    return (
        <WagmiProvider>
            <button
                onClick={() =>
                    addRecentTransaction({
                        hash: '0x4ed972aeffc46d97f45dd5229876fc0b27f3fe1231b32a7e6b9da12fbcfcb873',
                        description: 'test',
                    })
                }
            >
                add recent transaction
            </button>
            <ConnectWallet />
            <SignMessage />
        </WagmiProvider>
    );
}
