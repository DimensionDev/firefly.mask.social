import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SearchType } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';

interface SearchState {
    searchText: string;
    searchType: SearchType;
    resetSearchText: () => void;
    updateSearchText: (searchText: string) => void;
    updateSearchType: (searchType: SearchType) => void;
}

const useSearchStateBase = create<SearchState, [['zustand/immer', never]]>(
    immer((set) => {
        return {
            searchText: '',
            searchType: SearchType.Profiles,
            resetSearchText: () =>
                set((state) => {
                    const params = typeof location !== 'undefined' ? new URLSearchParams(location.search) : undefined;
                    state.searchText = params?.get('q') ?? '';
                }),
            updateSearchText: (searchText: string) =>
                set((state) => {
                    state.searchText = searchText;
                }),
            updateSearchType: (searchType: SearchType) =>
                set((state) => {
                    state.searchType = searchType;
                }),
        };
    }),
);

export const useSearchStore = createSelectors(useSearchStateBase);
