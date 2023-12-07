import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export interface LensState {
    profiles: Profile[];
    currentProfile: Profile | null;
    updateProfiles: (accounts: Profile[]) => void;
    updateCurrentProfile: (account: Profile) => void;
    clearCurrentProfile: () => void;
}

const useLensStateBase = create<LensState, [['zustand/persist', unknown], ['zustand/immer', unknown]]>(
    persist(
        immer((set, get) => ({
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
        })),
        {
            name: 'lens-state',
            partialize: (state) => ({ accounts: state.profiles, currentAccount: state.currentProfile }),
        },
    ),
);

export const useLensStateStore = createSelectors(useLensStateBase);
