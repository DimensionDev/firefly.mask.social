'use client';

import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { createReactClient, LivepeerConfig, studioProvider } from '@livepeer/react';
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SnackbarProvider } from 'notistack';
import { useEffect, useState } from 'react';
import { useEffectOnce } from 'react-use';
import { v4 as uuid } from 'uuid';

import { WagmiProvider } from '@/components/WagmiProvider.js';
import { useMounted } from '@/hooks/useMounted.js';
import { initLocale } from '@/i18n/index.js';
import { useLeafwatchPersistStore } from '@/store/useLeafwatchPersistStore.js';

const livepeerClient = createReactClient({
    provider: studioProvider({ apiKey: '' }),
});

export function Providers(props: { children: React.ReactNode }) {
    useEffect(() => {
        initLocale();
    }, []);

    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                    },
                },
            }),
    );

    const viewerId = useLeafwatchPersistStore.use.viewerId();
    const setViewerId = useLeafwatchPersistStore.use.setViewerId();

    useEffectOnce(() => {
        if (!viewerId) setViewerId(uuid());
    });

    useEffectOnce(() => {
        if ('serviceWorker' in navigator) {
            (navigator.serviceWorker as ServiceWorkerContainer).register('/sw.js', { scope: '/' }).catch(console.error);
        }
    });

    const mounted = useMounted();
    if (!mounted) return null;

    return (
        <I18nProvider i18n={i18n}>
            <QueryClientProvider client={queryClient}>
                <Hydrate>
                    <SnackbarProvider
                        maxSnack={30}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        autoHideDuration={3000}
                    >
                        <WagmiProvider>
                            <LivepeerConfig client={livepeerClient}>{props.children}</LivepeerConfig>
                        </WagmiProvider>
                    </SnackbarProvider>
                </Hydrate>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </I18nProvider>
    );
}
