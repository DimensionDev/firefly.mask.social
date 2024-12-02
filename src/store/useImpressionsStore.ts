import { create } from 'zustand';

import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';

interface Views {
    id: string;
    views: number;
}

interface ImpressionsState {
    publicationViews: Views[];
    fetchAndStoreViews: (ids: string[]) => Promise<void>;
}

const STATS_URL = '/api/publication-views';

const useImpressionsBase = create<ImpressionsState>((set) => ({
    publicationViews: EMPTY_LIST,
    fetchAndStoreViews: async (ids) => {
        // TODO implement fetchAndStoreViews with new api
        return;
    },
}));

export const useImpressionsStore = createSelectors(useImpressionsBase);
