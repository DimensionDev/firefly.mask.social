'use client';

import { useRouter } from 'next/navigation.js';
import type { PropsWithChildren } from 'react';

import { CZActivityContext } from '@/components/ActivityPage/CZ/CZActivityContext.js';
import { CZActivityClaimSuccessModalRef } from '@/modals/controls.js';

export default function Layout({ children }: PropsWithChildren) {
    const router = useRouter();

    return (
        <CZActivityContext.Provider
            value={{
                onClaim() {
                    CZActivityClaimSuccessModalRef.open();
                },
                goChecklist() {
                    router.push('/activity/cz/checklist');
                },
                type: 'page',
            }}
        >
            {children}
        </CZActivityContext.Provider>
    );
}
