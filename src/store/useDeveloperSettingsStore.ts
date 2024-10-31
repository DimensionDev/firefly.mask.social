import { FireflyRedPacket } from '@masknet/web3-providers';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { FIREFLY_DEV_ROOT_URL, FIREFLY_ROOT_URL } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { recordDevelopmentAPI } from '@/services/recordDevelopmentAPI.js';

interface DeveloperSettingsState {
    developmentAPI: boolean;
    updateDevelopmentAPI: (value: boolean) => void;

    telemetry: boolean;
    updateTelemetry: (value: boolean) => void;

    telemetryDebug: boolean;
    updateTelemetryDebug: (value: boolean) => void;
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
            developmentAPI: env.external.NEXT_PUBLIC_FIREFLY_DEV_API === STATUS.Enabled,
            updateDevelopmentAPI: (value: boolean) =>
                set((state) => {
                    updateRedPacketApiRoot(value);
                    recordDevelopmentAPI(value ? FIREFLY_DEV_ROOT_URL : FIREFLY_ROOT_URL);
                    state.developmentAPI = value;
                }),

            telemetry: env.external.NEXT_PUBLIC_TELEMETRY === STATUS.Enabled,
            updateTelemetry: (value: boolean) =>
                set((state) => {
                    state.telemetry = value;
                }),

            telemetryDebug: false,
            updateTelemetryDebug: (value: boolean) =>
                set((state) => {
                    state.telemetryDebug = value;
                }),
        })),
        {
            name: 'developer-settings',
            partialize: (state) => ({
                developmentAPI: state.developmentAPI,
                telemetry: state.telemetry,
                telemetryDebug: state.telemetryDebug,
            }),
            onRehydrateStorage: (state) => {
                recordDevelopmentAPI(state.developmentAPI ? FIREFLY_DEV_ROOT_URL : FIREFLY_ROOT_URL);
                updateRedPacketApiRoot(state.developmentAPI);
            },
        },
    ),
);

export const useDeveloperSettingsState = createSelectors(useDeveloperSettingsBase);
