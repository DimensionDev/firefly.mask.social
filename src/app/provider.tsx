'use client';

import { createReactClient, LivepeerConfig, studioProvider } from '@livepeer/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import React from 'react';

import { WagmiProvider } from '@/components/WagmiProvider.js';

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

    return (
        <QueryClientProvider client={queryClient}>
            <ReactQueryStreamedHydration>
                <WagmiProvider>
                    <LivepeerConfig client={livepeerClient}>{props.children}</LivepeerConfig>
                </WagmiProvider>
            </ReactQueryStreamedHydration>
            {<ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
}
