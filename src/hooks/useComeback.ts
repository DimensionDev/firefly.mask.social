'use client';

import { useRouter } from 'next/navigation.js';
import { useCallback } from 'react';

import { PageRoute } from '@/constants/enum.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export function useComeBack({ defaultPath = PageRoute.Home }: { defaultPath: PageRoute }) {
    const router = useRouter();

    return useCallback(() => {
        const routeChanged = useGlobalState.getState().routeChanged;
        if (!routeChanged) {
            router.push(defaultPath);
            return;
        }
        router.back();
    }, [defaultPath, router]);
}
