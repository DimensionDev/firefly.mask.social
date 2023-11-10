import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

import { NextAuthExample } from '@/components/NextAuthExample';
import { WagmiExample } from '@/components/WagmiExample';
import { FarcasterAuthExample } from '@/components/FarcasterAuthExample';
import { WagmiProvider } from '@/components/WagmiProvider';
import { WarpcastAuthExample } from '@/components/WarpcastAuthExample';

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
