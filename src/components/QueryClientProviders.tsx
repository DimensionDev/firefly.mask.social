'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import type React from 'react';

import { queryClient } from '@/configs/queryClient.js';
import { useMemo } from 'react';

export function QueryClientProviders({ children }: { children: React.ReactNode }) {
    const memoizedHydration = useMemo(
        () => <ReactQueryStreamedHydration>{children}</ReactQueryStreamedHydration>,
        [children],
    );

    return <QueryClientProvider client={queryClient}>{memoizedHydration}</QueryClientProvider>;
}
