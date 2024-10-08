import { usePathname, useRouter, useSearchParams } from 'next/navigation.js';
import { useCallback } from 'react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SearchType, Source } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { resolveSearchUrl } from '@/helpers/resolveSearchUrl.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';

interface SearchTypeState {
    source: Source | undefined;
    searchType: SearchType | undefined;
    updateSearchType: (type: SearchType) => void;
    updateSource: (source: Source) => void;
}

const useSearchStateBase = create<SearchTypeState, [['zustand/immer', never]]>(
    immer((set) => ({
        searchType: undefined,
        source: undefined,
        updateSearchType: (type: SearchType) =>
            set((state) => {
                state.searchType = type;
            }),
        updateSource: (source: Source) =>
            set((state) => {
                state.source = source;
            }),
    })),
);

const useStore = createSelectors(useSearchStateBase);

function getPathParams(path: string) {
    if (isRoutePathname(path, '/search/:source/:type', true)) {
        return {
            source: resolveSourceFromUrl(path.split('/')[2]),
            searchType: path.split('/')[3] as SearchType,
        };
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
    const { source, searchType, updateSearchType } = useStore();

    const pathParams = getPathParams(pathname);
    const currentSource = pathParams?.source || source || Source.Farcaster;
    const currentType = pathParams?.searchType || searchType || SearchType.Posts;

    const updateState = useCallback(
        (state: SearchState, replace?: boolean) => {
            const newQuery = state.q || params.get('q');
            const newType = state.type || currentType;

            updateSearchType(newType);

            // search input is empty
            if (!newQuery) return;

            const url = resolveSearchUrl(newQuery, newType, currentSource);
            if (replace) router.replace(url);
            else router.push(url);
        },
        [params, router, currentSource, currentType, updateSearchType],
    );

    return {
        // use ?? means '' is valid value, it was used when clear the search input
        searchKeyword: params.get('q') || '',
        searchType: currentType,
        source: currentSource,
        updateState,
        updateSearchType,
    };
}
