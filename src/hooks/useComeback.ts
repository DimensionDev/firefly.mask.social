import { useRouter } from 'next/navigation.js';
import { useCallback } from 'react';

import { useGlobalState } from '@/store/useGlobalStore.js';

export function useComeBack() {
    const routeChanged = useGlobalState.use.routeChanged();
    const router = useRouter();

    return useCallback(() => {
        if (!routeChanged) {
            router.push('/');
            return;
        }
        router.back();
    }, [routeChanged, router]);
}
