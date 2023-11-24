'use client';

import { createReactClient, LivepeerConfig, studioProvider } from '@livepeer/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { useEffectOnce } from 'react-use';
import { v4 as uuid } from 'uuid';

import { WagmiProvider } from '@/components/WagmiProvider.js';
import { useLeafwatchPersistStore } from '@/store/useLeafwatchPersistStore.js';

const livepeerClient = createReactClient({
    provider: studioProvider({ apiKey: '' }),
});
export function Providers(props: { children: React.ReactNode }) {
    const [queryClient] = React.useState(
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

    return (
        <QueryClientProvider client={queryClient}>
            <ReactQueryStreamedHydration>
                <SnackbarProvider
                    maxSnack={30}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    autoHideDuration={3000}
                >
                    <WagmiProvider>
                        <LivepeerConfig client={livepeerClient}>{props.children}</LivepeerConfig>
                    </WagmiProvider>
                </SnackbarProvider>
            </ReactQueryStreamedHydration>
            {<ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
}
