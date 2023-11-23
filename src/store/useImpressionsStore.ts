import { create } from 'zustand';

import { createSelectors } from '@/helpers/createSelector.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { LensPublicationViewCount } from '@/types/index.js';

interface ImpressionsState {
    publicationViews: LensPublicationViewCount[];
    fetchAndStoreViews: (ids: string[]) => Promise<void>;
}

const STATS_URL = 'https://api.hey.xyz/stats/publicationViews';

export const useImpressionsBase = create<ImpressionsState>((set) => ({
    publicationViews: [],
    fetchAndStoreViews: async (ids) => {
        if (!ids.length) {
            return;
        }

        const viewsResponse = await fetchJSON<{ success: boolean; views: LensPublicationViewCount[] }>(STATS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
        });

        if (!viewsResponse.success) return;

        set((state) => ({
            publicationViews: [...state.publicationViews, ...viewsResponse.views],
        }));
    },
}));

export const useImpressionsStore = createSelectors(useImpressionsBase);
