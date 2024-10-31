'use client';

import { useRouter } from 'next/navigation.js';
import { useCallback } from 'react';

import { PageRoute } from '@/constants/enum.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export function useComeBack(path = PageRoute.Home) {
    const router = useRouter();

    return useCallback(() => {
        const routeChanged = useGlobalState.getState().routeChanged;
        if (!routeChanged) {
            router.push(path);
            return;
        }
        router.back();
    }, [path, router]);
}
