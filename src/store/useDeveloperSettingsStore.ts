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

const useDeveloperSettingsBase = create<
    DeveloperSettingsState,
    [['zustand/persist', unknown], ['zustand/immer', never]]
>(
    persist(
        immer((set) => ({
            developmentAPI: env.external.NEXT_PUBLIC_FIREFLY_DEV_API === STATUS.Enabled,
            updateDevelopmentAPI: (value: boolean) =>
                set((state) => {
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
                const data = localStorage.getItem('developer-settings');
                const parsed: { state?: { developmentAPI?: boolean } } = data ? JSON.parse(data) : {};
                const enableDevelopmentAPI = parsed?.state?.developmentAPI ?? state.developmentAPI;
                recordDevelopmentAPI(enableDevelopmentAPI ? FIREFLY_DEV_ROOT_URL : FIREFLY_ROOT_URL);
            },
        },
    ),
);

export const useDeveloperSettingsState = createSelectors(useDeveloperSettingsBase);
