'use client';

import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

export interface NextAuthProviderProps {
    session: Session | null;
    children: React.ReactNode;
}

export function NextAuthProvider(props: NextAuthProviderProps) {
    return (
        <SessionProvider session={props.session} refetchInterval={5 * 60} refetchOnWindowFocus>
            {props.children}
        </SessionProvider>
    );
}
