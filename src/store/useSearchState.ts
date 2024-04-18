import { useRouter, useSearchParams } from 'next/navigation.js';
import { useCallback } from 'react';

import { SearchType } from '@/constants/enum.js';

export interface SearchState {
    type?: SearchType;
    q?: string;
}

export function useSearchState() {
    const params = useSearchParams();
    const router = useRouter();
    const searchKeyword = params.get('q') || '';
    const searchType = (params.get('type') ?? SearchType.Users) as SearchType;

    const updateState = useCallback(
        (state: SearchState, replace?: boolean) => {
            const newParams = new URLSearchParams(params);
            Object.entries(state).forEach(([key, val]) => {
                if (val) newParams.set(key, val);
            });
            const url = `/search?${newParams.toString()}`;
            if (!newParams.get('q')) return;
            if (replace) router.replace(url);
            else router.push(url);
        },
        [params, router],
    );

    return {
        searchKeyword,
        searchType,
        updateState,
    };
}
