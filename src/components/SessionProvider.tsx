import { getServerSession } from 'next-auth';
import { SessionProvider as SessionProviderReact } from 'next-auth/react';

import { authOptions } from '@/app/api/auth/[...nextauth]/options.js';

/**
 * Providers that data from server-side
 * @param props
 * @returns
 */
export async function SessionProvider(props: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    return <SessionProviderReact session={session}>{props.children}</SessionProviderReact>;
}
