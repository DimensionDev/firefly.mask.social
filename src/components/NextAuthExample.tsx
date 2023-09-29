'use client';

import { Session } from 'next-auth';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useMounted } from '@/hooks/useMounted';
import { NextAuthProvider } from '@/components/NextAuthProvider';

export interface NextAuthExampleProps {
    session: Session | null;
}

export function NextAuthExample(props: NextAuthExampleProps) {
    const mounted = useMounted();
    if (!mounted) return null;

    return (
        <NextAuthProvider session={props.session}>
            <Example />
        </NextAuthProvider>
    );
}

function Example() {
    const { data: session, status } = useSession();

    if (status === 'authenticated') {
        return (
            <div>
                <p>Signed in as {session.user?.email}</p>
                <button onClick={() => signOut()}>Sign out</button>
            </div>
        );
    }
    return (
        <div>
            <p>Hi, there!</p>
            <button onClick={() => signIn()}>Sign in</button>
        </div>
    );
}
