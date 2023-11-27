import { create } from 'zustand';

import { createSelectors } from '@/helpers/createSelector.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';

export interface LensPublicationViewCount {
    id: string;
    views: number;
}

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

        try {
            const viewsResponse = await fetchJSON<{ success: boolean; views: LensPublicationViewCount[] }>(STATS_URL, {
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
