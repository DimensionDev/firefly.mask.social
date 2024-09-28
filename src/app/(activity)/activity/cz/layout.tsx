'use client';

import { useRouter } from 'next/navigation.js';
import { type PropsWithChildren, useEffect } from 'react';

import { ActivityContextProvider } from '@/components/CZ/ActivityContext.js';
import { ActivityClaimSuccessModalRef } from '@/modals/controls.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { SITE_URL } from '@/constants/index.js';
import urlcat from 'urlcat';

export default function Layout({ children }: PropsWithChildren) {
    const router = useRouter();

    useEffect(() => {
        if (window.location.hostname === 'cz.firefly.social' && !fireflyBridgeProvider.supported) {
            window.location.href = urlcat(SITE_URL, '/farcaster/trending', {
                modal: 'cz',
            });
        }
    }, []);

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
