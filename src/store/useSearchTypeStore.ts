import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { SearchType } from '@/constants/enum.js';

import { createSelectors } from '@/helpers/createSelector.js';

interface SearchTypeState {
    searchType: SearchType;
    updateSearchType: (type: SearchType) => void;
}

const useSearchTypeStateBase = create<SearchTypeState, [['zustand/immer', never]]>(
    immer((set) => ({
        searchType: SearchType.Users,
        updateSearchType: (type: SearchType) =>
            set((state) => {
                state.searchType = type;
            }),
    })),
);

export const useSearchTypeState = createSelectors(useSearchTypeStateBase);
