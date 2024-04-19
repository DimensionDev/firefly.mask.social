import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SearchType } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';

interface SearchTypeState {
    searchKeyword: string | undefined;
    searchType: SearchType | undefined;
    updateSearchKeyword: (keyword: string) => void;
    updateSearchType: (type: SearchType) => void;
}

const useSearchTypeStateBase = create<SearchTypeState, [['zustand/immer', never]]>(
    immer((set) => ({
        searchKeyword: undefined,
        searchType: undefined,
        updateSearchKeyword: (keyword: string) =>
            set((state) => {
                state.searchKeyword = keyword;
            }),
        updateSearchType: (type: SearchType) =>
            set((state) => {
                state.searchType = type;
            }),
    })),
);

export const useSearchTypeState = createSelectors(useSearchTypeStateBase);
