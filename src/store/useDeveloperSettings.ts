import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from '@/helpers/createSelector.js';

interface DeveloperSettingsState {
    useDevelopmentAPI: boolean;
    updateUseDevelopmentAPI: (value: boolean) => void;
}

const useDeveloperSettingsBase = create<
    DeveloperSettingsState,
    [['zustand/persist', unknown], ['zustand/immer', never]]
>(
    persist(
        immer((set) => ({
            useDevelopmentAPI: false,
            updateUseDevelopmentAPI: (value: boolean) =>
                set((state) => {
                    state.useDevelopmentAPI = value;
                }),
        })),
        {
            name: 'developer-settings',
            partialize: (state) => ({
                useDevelopmentAPI: state.useDevelopmentAPI,
            }),
        },
    ),
);

export const useDeveloperSettings = createSelectors(useDeveloperSettingsBase);
