'use client';

import { useRouter } from 'next/navigation.js';
import type { PropsWithChildren } from 'react';

import { ActivityContext } from '@/components/CZ/ActivityContext.js';
import { ActivityClaimSuccessModalRef } from '@/modals/controls.js';

export default function Layout({ children }: PropsWithChildren) {
    const router = useRouter();

    return (
        <ActivityContext.Provider
            value={{
                onClaim() {
                    ActivityClaimSuccessModalRef.open();
                },
                goChecklist() {
                    router.push('/activity/cz/checklist');
                },
                type: 'page',
            }}
        >
            {children}
        </ActivityContext.Provider>
    );
}