import { usePathname, useRouter, useSearchParams } from 'next/navigation.js';
import { useCallback } from 'react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SearchType } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';

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

function getSearchTypeFromPath(path: string) {
    if (isRoutePathname(path, '/search/:type', true)) {
        const searchType = path.split('/')[2];
        return searchType as SearchType;
    }

    return;
}

export interface SearchState {
    type?: SearchType;
    q?: string;
}

export function useSearchStateStore() {
    const params = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { searchType, updateSearchType } = useStore();

    const updateState = useCallback(
        (state: SearchState, replace?: boolean) => {
            const newParams = new URLSearchParams(params);
            const newType = state.type || SearchType.Posts;

            if (state.q) {
                newParams.set('q', state.q);
            }
            updateSearchType(newType);

            // search input is empty
            if (!newParams.get('q')) return;

            const url = `/search/${newType}/?${newParams.toString()}`;
            if (replace) router.replace(url);
            else router.push(url);
        },
        [params, router, updateSearchType],
    );

    return {
        // use ?? means '' is valid value, it was used when clear the search input
        searchKeyword: params.get('q') || '',
        searchType: getSearchTypeFromPath(pathname) || searchType || SearchType.Posts,
        updateState,
        updateSearchType,
    };
}
