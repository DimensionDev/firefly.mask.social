import { WagmiExample } from '@/components/WagmiExample.js';
import { FarcasterAuthExample } from '@/components/FarcasterAuthExample.js';
import { WagmiProvider } from '@/components/WagmiProvider.js';
import { WarpcastAuthExample } from '@/components/WarpcastAuthExample.js';

export default async function Home() {
    return (
        <>
            <h2>Wagmi</h2>
            <WagmiExample />

            <h2 className="mt-8">Farcaster</h2>
            <WagmiProvider>
                <FarcasterAuthExample />
            </WagmiProvider>

            <h2 className="mt-8">Warpcast</h2>
            <WarpcastAuthExample />
        </>
    );
}
