import { useRouter } from 'next/navigation.js';
import { useCallback } from 'react';

export function useUpdateParams() {
    const router = useRouter();

    return useCallback(
        (patch: URLSearchParams, pathname?: string) => {
            const params = new URLSearchParams(location.search);
            patch.forEach((value, key) => params.set(key, value));
            const url = `${pathname ?? location.pathname}?${params.toString()}`;
            router.replace(url);
        },
        [router],
    );
}
