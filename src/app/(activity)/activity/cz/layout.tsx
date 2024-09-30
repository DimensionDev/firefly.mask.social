'use client';

import { useRouter } from 'next/navigation.js';
import { type PropsWithChildren, useEffect } from 'react';
import urlcat from 'urlcat';

import { ActivityContextProvider } from '@/components/CZ/ActivityContext.js';
import { SITE_URL } from '@/constants/index.js';
import { ActivityClaimSuccessModalRef } from '@/modals/controls.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';

export default function Layout({ children }: PropsWithChildren) {
    const router = useRouter();
    if (
        typeof window !== 'undefined' &&
        window.location.hostname === 'cz.firefly.social' &&
        !fireflyBridgeProvider.supported
    ) {
        window.location.href = urlcat(SITE_URL, '/farcaster/trending', {
            modal: 'cz',
        });
    }

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
