import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { warpcastClient } from '@/configs/warpcastClient.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import type { Session } from '@/providers/types/Session.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import type { WarpcastSession } from '@/providers/warpcast/Session.js';

export interface FarcasterState {
    profiles: Profile[];
    currentProfile: Profile | null;
    currentProfileSession: Session | null;
    updateCurrentProfile: (profile: Profile, session: Session) => void;
    updateProfiles: (profiles: Profile[]) => void;
    clearCurrentProfile: () => void;
}

const useFarcasterStateBase = create<FarcasterState, [['zustand/persist', unknown], ['zustand/immer', unknown]]>(
    persist(
        immer<FarcasterState>((set, get) => ({
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
            name: 'farcaster-state',
            partialize: (state) => ({ profiles: state.profiles, currentProfile: state.currentProfile }),
            onRehydrateStorage: () => async (state) => {
                const session = state?.currentProfileSession;

                if (session && session.expiresAt > Date.now()) {
                    console.warn('[farcaster store] session expired');
                    state?.clearCurrentProfile();
                    return;
                }

                if (session) {
                    warpcastClient.resumeSession(session as WarpcastSession);
                }
            },
        },
    ),
);

export const useFarcasterStateStore = createSelectors(useFarcasterStateBase);
