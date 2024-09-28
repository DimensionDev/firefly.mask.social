'use client';

import { useRouter } from 'next/navigation.js';
import type { PropsWithChildren } from 'react';

import { ActivityContextProvider } from '@/components/CZ/ActivityContext.js';
import { ActivityClaimSuccessModalRef } from '@/modals/controls.js';

export default function Layout({ children }: PropsWithChildren) {
    const router = useRouter();

    return (
        <ActivityContextProvider
            value={{
                onClaim(hash) {
                    router.push('/activity/cz');
                    ActivityClaimSuccessModalRef.open({ hash });
                },
                goChecklist() {
                    router.push('/activity/cz/checklist');
                },
                type: 'page',
            }}
        >
            {children}
        </ActivityContextProvider>
    );
}
