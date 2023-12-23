import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { farcasterClient } from '@/configs/farcasterClient.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { createSessionStorage } from '@/helpers/createSessionStorage.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import type { Session } from '@/providers/types/Session.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface FarcasterState {
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
            storage: createSessionStorage(),
            partialize: (state) => ({
                profiles: state.profiles,
                currentProfile: state.currentProfile,
                currentProfileSession: state.currentProfileSession,
            }),
            onRehydrateStorage: () => async (state) => {
                if (typeof window === 'undefined') return;

                const session = state?.currentProfileSession;

                if (session && session.expiresAt < Date.now()) {
                    console.warn('[farcaster store] session expired');
                    state?.clearCurrentProfile();
                    return;
                }
                if (session) {
                    farcasterClient.resumeSession(session as FarcasterSession);
                }
            },
        },
    ),
);

export const useFarcasterStateStore = createSelectors(useFarcasterStateBase);
