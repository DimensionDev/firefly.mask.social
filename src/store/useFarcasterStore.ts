import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export interface FarcasterState {
    profiles: Profile[];
    currentProfile: Profile | null;
    updateCurrentProfile: (account: Profile) => void;
    updateProfiles: (accounts: Profile[]) => void;
    clearCurrentProfile: () => void;
    hydrateCurrentProfile: () => Profile | null;
}

const useFarcasterStateBase = create<FarcasterState, [['zustand/persist', unknown], ['zustand/immer', unknown]]>(
    persist(
        immer<FarcasterState>((set, get) => ({
            profiles: EMPTY_LIST,
            currentProfile: null,
            updateCurrentProfile: (account: Profile) =>
                set((state) => {
                    state.currentProfile = account;
                }),
            updateProfiles: (accounts: Profile[]) =>
                set((state) => {
                    state.profiles = accounts;
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
            partialize: (state) => ({ accounts: state.profiles, currentAccount: state.currentProfile }),
        },
    ),
);

export const useFarcasterStateStore = createSelectors(useFarcasterStateBase);

export const hydrateCurrentProfile = () => useFarcasterStateBase.getState().hydrateCurrentProfile();
