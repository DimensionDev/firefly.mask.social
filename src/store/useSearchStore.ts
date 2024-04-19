import { useRouter, useSearchParams } from 'next/navigation.js';
import { useCallback } from 'react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SearchType } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';

interface SearchTypeState {
    searchType: SearchType | undefined;
    updateSearchType: (type: SearchType) => void;
}

const useSearchStateBase = create<SearchTypeState, [['zustand/immer', never]]>(
    immer((set) => ({
        searchType: undefined,
        updateSearchType: (type: SearchType) =>
            set((state) => {
                state.searchType = type;
            }),
    })),
);

const useStore = createSelectors(useSearchStateBase);

export interface SearchState {
    type?: SearchType;
    q?: string;
}

export function useSearchStateStore() {
    const params = useSearchParams();
    const router = useRouter();
    const { searchType, updateSearchType } = useStore();

    const updateState = useCallback(
        (state: SearchState, replace?: boolean) => {
            const newParams = new URLSearchParams(params);

            if (state.q) {
                newParams.set('q', state.q);
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
        [params, router, updateSearchType],
    );

    return {
        // use ?? means '' is valid value, it was used when clear the search input
        searchKeyword: params.get('q') || '',
        searchType: searchType || (params.get('type') as SearchType) || SearchType.Posts,
        updateState,
        updateSearchType,
    };
}
