import { getServerSession } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { authOptions } from '@/app/api/auth/[...nextauth]/options.js';

export async function ServerProviders(props: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    return <SessionProvider session={session}>{props.children}</SessionProvider>;
}
