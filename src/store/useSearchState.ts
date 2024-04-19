import { useRouter, useSearchParams } from 'next/navigation.js';
import { useCallback } from 'react';

import { SearchType } from '@/constants/enum.js';
import { useSearchTypeState } from '@/store/useSearchTypeStore.js';

export interface SearchState {
    type?: SearchType;
    q?: string;
}

export function useSearchState() {
    const params = useSearchParams();
    const router = useRouter();
    const searchKeyword = params.get('q') || '';
    const searchType_ = (params.get('type') as SearchType) || SearchType.Users;
    const { searchType = searchType_, updateSearchType } = useSearchTypeState();

    const updateState = useCallback(
        (state: SearchState, replace?: boolean) => {
            const newParams = new URLSearchParams(params);

            if (state.type) {
                newParams.set('type', state.type);
                updateSearchType(state.type);
            }

            Object.entries(state).forEach(([key, val]) => {
                if (val) newParams.set(key, val);
            });

            const url = `/search?${newParams.toString()}`;
            if (!newParams.get('q')) return;
            if (replace) router.replace(url);
            else router.push(url);
        },
        [params, router, updateSearchType],
    );

    return {
        searchKeyword,
        searchType,
        updateState,
    };
}
