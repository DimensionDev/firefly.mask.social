import { create } from 'zustand';

import { NODE_ENV } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
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

const STATS_URL = '/api/publication-views';

const useImpressionsBase = create<ImpressionsState>((set) => ({
    publicationViews: EMPTY_LIST,
    fetchAndStoreViews: async (ids) => {
        if (env.shared.NODE_ENV === NODE_ENV.Development) return;
        if (!ids.length) return;

        try {
            const viewsResponse = await fetchJSON<{ data: { success: boolean; views: Views[] } }>(STATS_URL, {
                method: 'POST',
                body: JSON.stringify({ ids }),
            });

            if (!viewsResponse.data.success) return;

            set((state) => ({
                publicationViews: [...state.publicationViews, ...viewsResponse.data.views],
            }));
        } catch {
            return;
        }
    },
}));

export const useImpressionsStore = createSelectors(useImpressionsBase);
