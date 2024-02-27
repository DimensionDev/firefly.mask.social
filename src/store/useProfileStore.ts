import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { farcasterClient } from '@/configs/farcasterClient.js';
import { createLensClient } from '@/configs/lensClient.js';
import { queryClient } from '@/configs/queryClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { createSessionStorage } from '@/helpers/createSessionStorage.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Session } from '@/providers/types/Session.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileState {
    profiles: Profile[];
    currentProfile: Profile | null;
    currentProfileSession: Session | null;
    updateProfiles: (profiles: Profile[]) => void;
    updateCurrentProfile: (profile: Profile, session: Session) => void;
    refreshCurrentProfile: () => void;
    refreshProfiles: () => void;
    clearCurrentProfile: () => void;
}

const useFarcasterStateBase = create<ProfileState, [['zustand/persist', unknown], ['zustand/immer', unknown]]>(
    persist(
        immer<ProfileState>((set, get) => ({
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
            refreshCurrentProfile: async () => {
                const profile = get().currentProfile;
                if (!profile) return;
                const updatedProfile = await FarcasterSocialMediaProvider.getProfileById(profile.profileId);
                set((state) => {
                    state.currentProfile = updatedProfile;
                });
            },
            refreshProfiles: async () => {
                const profile = get().currentProfile;
                const profiles = get().profiles;

                const updatedProfiles = await Promise.all(
                    profiles.map((profile) => FarcasterSocialMediaProvider.getProfileById(profile.profileId)),
                );

                set((state) => {
                    state.profiles = updatedProfiles;

                    const currentProfile = profiles.find((p) => isSameProfile(p, profile));
                    if (currentProfile) state.currentProfile = currentProfile;
                });
            },
            clearCurrentProfile: () =>
                set((state) => {
                    queryClient.resetQueries({
                        queryKey: ['profile', 'is-following', SocialPlatform.Farcaster],
                    });
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

const useLensStateBase = create<ProfileState, [['zustand/persist', unknown], ['zustand/immer', unknown]]>(
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
            refreshCurrentProfile: async () => {
                const profile = get().currentProfile;
                if (!profile) return;
                const updatedProfile = await LensSocialMediaProvider.getProfileByHandle(profile.handle);
                set((state) => {
                    state.currentProfile = updatedProfile;
                });
            },
            refreshProfiles: async () => {
                const profile = get().currentProfile;
                const profiles = get().profiles;

                const updatedProfiles = await Promise.all(
                    profiles.map((profile) => LensSocialMediaProvider.getProfileByHandle(profile.handle)),
                );

                set((state) => {
                    state.profiles = updatedProfiles;

                    const currentProfile = profiles.find((p) => isSameProfile(p, profile));
                    if (currentProfile) state.currentProfile = currentProfile;
                });
            },
            clearCurrentProfile: () =>
                set((state) => {
                    queryClient.resetQueries({
                        queryKey: ['profile', 'is-following', SocialPlatform.Lens],
                    });
                    state.currentProfile = null;
                }),
        })),
        {
            name: 'lens-state',
            storage: createSessionStorage(),
            partialize: (state) => ({
                profiles: state.profiles,
                currentProfile: state.currentProfile,
                currentProfileSession: state.currentProfileSession,
            }),
            onRehydrateStorage: () => async (state) => {
                if (typeof window === 'undefined') return;

                const lensClient = createLensClient();

                const profileId = state?.currentProfile?.profileId;
                const clientProfileId = await lensClient.authentication.getProfileId();

                if (!clientProfileId || (profileId && clientProfileId !== profileId)) {
                    console.warn('[lens store] clean the local store because the client cannot recover properly');
                    state?.clearCurrentProfile();
                    return;
                }

                const authenticated = await lensClient.authentication.isAuthenticated();
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
export const useFarcasterStateStore = createSelectors(useFarcasterStateBase);

export function getLensToken() {
    return useLensStateBase.getState().currentProfileSession?.token;
}
