import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createSelectors } from '@/helpers/createSelector.js';

interface LeafwatchPersistState {
    viewerId: string | null;
    setViewerId: (viewerId: string) => void;
    hydrateLeafwatchViewerId: () => string | null;
}

const useLeafwatchPersistBase = create(
    persist<LeafwatchPersistState>(
        (set, get) => ({
            viewerId: null,
            setViewerId: (viewerId) => set({ viewerId }),
            hydrateLeafwatchViewerId: () => {
                return get().viewerId;
            },
        }),
        { name: 'leafwatch.store' },
    ),
);

export const useLeafwatchPersistStore = createSelectors(useLeafwatchPersistBase);
