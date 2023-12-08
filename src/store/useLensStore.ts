import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createLensClient } from '@/configs/lensClient.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import type { Session } from '@/providers/types/Session.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export interface LensState {
    profiles: Profile[];
    currentProfile: Profile | null;
    currentProfileSession: Session | null;
    updateProfiles: (profiles: Profile[]) => void;
    updateCurrentProfile: (profile: Profile, session: Session) => void;
    clearCurrentProfile: () => void;
}

const useLensStateBase = create<LensState, [['zustand/persist', unknown], ['zustand/immer', unknown]]>(
    persist(
        immer((set, get) => ({
            profiles: EMPTY_LIST,
            currentProfile: null,
            currentProfileSession: null,
            updateProfiles: (profiles: Profile[]) =>
                set((state) => {
                    state.profiles = profiles;
                }),
            updateCurrentProfile: (profile: Profile, session: Session) =>
                set((state) => {
                    state.currentProfile = profile;
                    state.currentProfileSession = session;
                }),
            clearCurrentProfile: () =>
                set((state) => {
                    state.currentProfile = null;
                }),
        })),
        {
            name: 'lens-state',
            partialize: (state) => ({
                profiles: state.profiles,
                currentProfile: state.currentProfile,
            }),
            onRehydrateStorage: () => async (state) => {
                const profileId = state?.currentProfile?.profileId;

                const client = createLensClient();
                const clientProfileId = await client.authentication.getProfileId();

                if (!clientProfileId || (profileId && clientProfileId !== profileId)) {
                    console.warn('[lens store] clean the local store because the client cannot recover properly');
                    state?.clearCurrentProfile();
                    return;
                }

                const authenticated = await client.authentication.isAuthenticated();
                if (!authenticated) {
                    console.warn('[lens store] clean the local profile because the client session is broken');
                    state?.clearCurrentProfile();
                    return;
                }
            },
        },
    ),
);

export const useLensStateStore = createSelectors(useLensStateBase);
