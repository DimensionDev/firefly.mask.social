import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from '@/helpers/createSelector.js';

interface Preferences {
    SHOW_SCHEDULE_POST_TIP: boolean;
}

const defaultPreferences: Preferences = {
    SHOW_SCHEDULE_POST_TIP: true,
};

export interface PreferencesState {
    preferences: Preferences;
    getPreference<T extends keyof Preferences>(key: T): Preferences[T];
    setPreference<T extends keyof Preferences>(key: T, value: Preferences[T]): void;
    resetPreferences(): void;
}

const PreferencesState = create<PreferencesState, [['zustand/persist', unknown], ['zustand/immer', unknown]]>(
    persist(
        immer<PreferencesState>((set, get) => ({
            preferences: defaultPreferences,
            getPreference(key: keyof Preferences) {
                return get().preferences[key];
            },
            setPreference<T extends keyof Preferences>(key: T, value: Preferences[T]) {
                return set((state) => {
                    state.preferences[key] = value;
                });
            },
            resetPreferences() {
                return set((state) => {
                    state.preferences = defaultPreferences;
                });
            },
        })),
        {
            name: 'firefly-preferences',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

export const usePreferencesState = createSelectors(PreferencesState);
