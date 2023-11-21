'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { WagmiProvider } from '@/components/WagmiProvider.js';
import { LivepeerConfig, createReactClient, studioProvider } from '@livepeer/react';

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
