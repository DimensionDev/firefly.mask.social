import { useRouter, useSearchParams } from 'next/navigation.js';
import { useCallback, useEffect } from 'react';
import { useSearchTypeState } from '@/store/useSearchTypeStore.js';

import { SearchType } from '@/constants/enum.js';

export interface SearchState {
    type?: SearchType;
    q?: string;
}

export function useSearchState() {
    const params = useSearchParams();
    const router = useRouter();
    const searchKeyword = params.get('q') || '';
    const { searchType, updateSearchType } = useSearchTypeState();

    useEffect(() => {
        const type = params.get('type') as SearchType;
        if (type) updateSearchType(type);
    }, [params, searchType, updateSearchType]);

    const updateState = useCallback(
        (state: SearchState, replace?: boolean) => {
            const newParams = new URLSearchParams(params);
            if (state.type) {
                updateSearchType(state.type);
                newParams.set('type', state.type);
            }
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
