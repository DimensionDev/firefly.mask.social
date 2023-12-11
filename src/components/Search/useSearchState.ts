import { useRouter, useSearchParams } from 'next/navigation.js';
import { useCallback } from 'react';

import { SearchType } from '@/constants/enum.js';

export function useSearchState() {
    const params = useSearchParams();
    const keyword = params.get('q') || '';
    const searchType: SearchType = (params.get('type') ?? SearchType.Profiles) as SearchType;
    const router = useRouter();

    const updateParams = useCallback(
        (obj: Partial<Record<string, string>>, replace?: boolean) => {
            const newParams = new URLSearchParams(params);
            Object.entries(obj).forEach(([key, val]) => {
                if (val) newParams.set(key, val);
            });
            const url = `/search?${newParams.toString()}`;
            if (replace) router.replace(url);
            else router.push(url);
        },
        [params, router],
    );

    return {
        keyword,
        searchType,
        updateParams,
    };
}
