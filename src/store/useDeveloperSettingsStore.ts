import { FireflyRedPacket } from '@masknet/web3-providers';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { FIREFLY_DEV_ROOT_URL, FIREFLY_ROOT_URL } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';

interface DeveloperSettingsState {
    useDevelopmentAPI: boolean;
    updateUseDevelopmentAPI: (value: boolean) => void;

    logTelemetry: boolean;
    updateLogTelemetry: (value: boolean) => void;
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
            useDevelopmentAPI: env.external.NEXT_PUBLIC_ENABLED_FIREFLY_DEV_API === STATUS.Enabled,
            updateUseDevelopmentAPI: (value: boolean) =>
                set((state) => {
                    updateRedPacketApiRoot(value);
                    state.useDevelopmentAPI = value;
                }),

            logTelemetry: false,
            updateLogTelemetry: (value: boolean) =>
                set((state) => {
                    state.logTelemetry = value;
                }),
        })),
        {
            name: 'developer-settings',
            partialize: (state) => ({
                useDevelopmentAPI: state.useDevelopmentAPI,
                captureTelemetry: state.logTelemetry,
            }),
            onRehydrateStorage: (state) => {
                updateRedPacketApiRoot(state.useDevelopmentAPI);
            },
        },
    ),
);

export const useDeveloperSettingsState = createSelectors(useDeveloperSettingsBase);
