import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export interface FarcasterState {
    profiles: Profile[];
    currentProfile: Profile | null;
    updateCurrentProfile: (profile: Profile) => void;
    updateProfiles: (profiles: Profile[]) => void;
    clearCurrentProfile: () => void;
    hydrateCurrentProfile: () => Profile | null;
}

const useFarcasterStateBase = create<FarcasterState, [['zustand/persist', unknown], ['zustand/immer', unknown]]>(
    persist(
        immer<FarcasterState>((set, get) => ({
            profiles: EMPTY_LIST,
            currentProfile: null,
            updateCurrentProfile: (profile: Profile) =>
                set((state) => {
                    state.currentProfile = profile;
                }),
            updateProfiles: (profiles: Profile[]) =>
                set((state) => {
                    state.profiles = profiles;
                }),
            clearCurrentProfile: () =>
                set((state) => {
                    state.currentProfile = null;
                }),
            hydrateCurrentProfile: () => {
                return get().currentProfile;
            },
        })),
        {
            name: 'farcaster-state',
            partialize: (state) => ({ profiles: state.profiles, currentProfile: state.currentProfile }),
            onRehydrateStorage: () => async (state) => {},
        },
    ),
);

export const useFarcasterStateStore = createSelectors(useFarcasterStateBase);

export const hydrateCurrentProfile = () => useFarcasterStateBase.getState().hydrateCurrentProfile();
