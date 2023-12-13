import { create } from 'zustand';

import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';

interface Views {
    id: string;
    views: number;
}

interface ImpressionsState {
    publicationViews: Views[];
    fetchAndStoreViews: (ids: string[]) => Promise<void>;
}

const STATS_URL = 'https://api.hey.xyz/stats/publicationViews';

export const useImpressionsBase = create<ImpressionsState>((set) => ({
    publicationViews: EMPTY_LIST,
    fetchAndStoreViews: async (ids) => {
        if (!ids.length) {
            return;
        }

        try {
            const viewsResponse = await fetchJSON<{ success: boolean; views: Views[] }>(STATS_URL, {
                method: 'POST',
                body: JSON.stringify({ ids }),
            });

            if (!viewsResponse.success) return;

            set((state) => ({
                publicationViews: [...state.publicationViews, ...viewsResponse.views],
            }));
        } catch {
            return;
        }
    },
}));

export const useImpressionsStore = createSelectors(useImpressionsBase);
