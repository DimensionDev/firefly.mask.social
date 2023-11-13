import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options.js';
import { NextAuthExample } from '@/components/NextAuthExample.js';
import { WagmiExample } from '@/components/WagmiExample.js';
import { FarcasterAuthExample } from '@/components/FarcasterAuthExample.js';
import { WagmiProvider } from '@/components/WagmiProvider.js';
import { WarpcastAuthExample } from '@/components/WarpcastAuthExample.js';

async function getSession() {
    return await getServerSession(authOptions);
}

export default async function Home() {
    const session = await getSession();

    return (
        <>
            <h2>Wagmi</h2>
            <WagmiExample />

            <h2 className="mt-8">Twitter</h2>
            <NextAuthExample session={session} />

            <h2 className="mt-8">Farcaster</h2>
            <WagmiProvider>
                <FarcasterAuthExample />
            </WagmiProvider>

            <h2 className="mt-8">Warpcast</h2>
            <WarpcastAuthExample />
        </>
    );
}
