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
    const searchKeyword_ = params.get('q') || '';
    const searchType_ = (params.get('type') as SearchType) || SearchType.Users;
    const {
        searchKeyword = searchKeyword_,
        searchType = searchType_,
        updateSearchKeyword,
        updateSearchType,
    } = useSearchTypeState();

    const updateState = useCallback(
        (state: SearchState, replace?: boolean) => {
            const newParams = new URLSearchParams(params);

            if (state.q) {
                newParams.set('q', state.q);
                updateSearchKeyword(state.q);
            }
            if (state.type) {
                newParams.set('type', state.type);
                updateSearchType(state.type);
            }

            // search input is empty
            if (!newParams.get('q')) return;

            const url = `/search?${newParams.toString()}`;
            if (replace) router.replace(url);
            else router.push(url);
        },
        [params, router, updateSearchKeyword, updateSearchType],
    );

    return {
        searchKeyword,
        searchType,
        updateState,
    };
}
