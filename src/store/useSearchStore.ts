import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SearchType } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';

interface SearchState {
    searchText: string;
    searchType: SearchType;
    updateSearchText: (searchText: string) => void;
    updateSearchType: (searchType: SearchType) => void;
}

const useSearchStateBase = create<SearchState, [['zustand/immer', never]]>(
    immer((set) => {
        return {
            searchText: '',
            searchType: SearchType.Profiles,
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
