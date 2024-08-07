import { FireflyRedPacket } from '@masknet/web3-providers';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { FIREFLY_DEV_ROOT_URL, FIREFLY_ROOT_URL } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';

interface DeveloperSettingsState {
    useDevelopmentAPI: boolean;
    updateUseDevelopmentAPI: (value: boolean) => void;
}

function updateRedPacketApiRoot(devMode: boolean) {
    FireflyRedPacket.updateApiRoot(devMode ? FIREFLY_DEV_ROOT_URL : FIREFLY_ROOT_URL);
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
                    updateRedPacketApiRoot(value);
                    state.useDevelopmentAPI = value;
                }),
        })),
        {
            name: 'developer-settings',
            partialize: (state) => ({
                useDevelopmentAPI: state.useDevelopmentAPI,
            }),
            onRehydrateStorage: (state) => {
                updateRedPacketApiRoot(state.useDevelopmentAPI);
            },
        },
    ),
);

export const useDeveloperSettingsState = createSelectors(useDeveloperSettingsBase);
