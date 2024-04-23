import { compact } from 'lodash-es';
import { create } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { farcasterClient } from '@/configs/farcasterClient.js';
import { lensClient } from '@/configs/lensClient.js';
import { queryClient } from '@/configs/queryClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { createSessionStorage } from '@/helpers/createSessionStorage.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { Session } from '@/providers/types/Session.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { syncSessionFromFirefly } from '@/services/syncSessionFromFirefly.js';

interface ProfileState {
    profiles: Profile[];
    currentProfile: Profile | null;
    currentProfileSession: Session | null;
    updateProfiles: (profiles: Profile[]) => void;
    updateCurrentProfile: (profile: Profile, session: Session) => void;
    syncCurrentProfile: (profile: Profile, session: Session) => void;
    refreshCurrentProfile: () => void;
    refreshProfiles: () => void;
    clearCurrentProfile: () => void;
}

interface ProfileStatePersisted {
    profiles: Profile[];
    currentProfile: Profile | null;
    currentProfileSession: Session | null;
}

function createState(
    provider: {
        getUpdatedProfile: (profile: Profile) => Promise<Profile | null>;
    },
    options: PersistOptions<ProfileState, ProfileStatePersisted>,
) {
    return create<ProfileState, [['zustand/persist', unknown], ['zustand/immer', unknown]]>(
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
                syncCurrentProfile: async (profile: Profile, session: Session) => {
                    const metrics = await syncSessionFromFirefly(session);
                    console.log('DEBUG: metrics');
                    console.log({
                        metrics,
                    });
                },
                refreshCurrentProfile: async () => {
                    const profile = get().currentProfile;
                    if (!profile) return;

                    const updatedProfile = await provider.getUpdatedProfile(profile);
                    if (!updatedProfile) return;

                    set((state) => {
                        state.currentProfile = updatedProfile;
                    });
                },
                refreshProfiles: async () => {
                    const profile = get().currentProfile;
                    const profiles = get().profiles;

                    const updatedProfiles = compact(
                        await Promise.all(profiles.map((profile) => provider.getUpdatedProfile(profile))),
                    );
                    if (!updatedProfiles.length) return;

                    set((state) => {
                        const currentProfile = profiles.find((p) => isSameProfile(p, profile));
                        if (currentProfile) state.currentProfile = currentProfile;

                        state.profiles = updatedProfiles;
                    });
                },
                clearCurrentProfile: () =>
                    set((state) => {
                        queryClient.resetQueries({
                            queryKey: ['profile', 'is-following', SocialPlatform.Farcaster],
                        });
                        state.currentProfile = null;
                        state.currentProfileSession = null;
                    }),
            })),
            options,
        ),
    );
}

const useFarcasterStateBase = createState(
    {
        getUpdatedProfile: (profile: Profile) => FarcasterSocialMediaProvider.getProfileById(profile.profileId),
    },
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
);

const useLensStateBase = createState(
    {
        getUpdatedProfile: (profile: Profile) => LensSocialMediaProvider.getProfileByHandle(profile.handle),
    },
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

            const profileId = state?.currentProfile?.profileId;
            const clientProfileId = await lensClient.sdk.authentication.getProfileId();

            if (!clientProfileId || (profileId && clientProfileId !== profileId)) {
                console.warn('[lens store] clean the local store because the client cannot recover properly');
                state?.clearCurrentProfile();
                return;
            }

            const authenticated = await lensClient.sdk.authentication.isAuthenticated();
            if (!authenticated) {
                console.warn('[lens store] clean the local profile because the client session is broken');
                state?.clearCurrentProfile();
                return;
            }
        },
    },
);

const useTwitterStateBase = createState(
    {
        getUpdatedProfile: () => Promise.resolve(null),
    },
    {
        name: 'twitter-state',
        storage: createSessionStorage(),
        partialize: (state) => ({
            profiles: state.profiles,
            currentProfile: state.currentProfile,
            currentProfileSession: state.currentProfileSession,
        }),
        onRehydrateStorage: () => async (state) => {
            if (typeof window === 'undefined') return;

            try {
                const me = await TwitterSocialMediaProvider.me();

                if (!me) {
                    console.warn('[twitter store] clean the local store because no session found from the server.');
                    state?.clearCurrentProfile();
                    return;
                }

                state?.updateProfiles([me]);
                state?.updateCurrentProfile(me, TwitterSession.from(me));
            } catch {
                state?.clearCurrentProfile();
            }
        },
    },
);

export const useLensStateStore = createSelectors(useLensStateBase);
export const useFarcasterStateStore = createSelectors(useFarcasterStateBase);
export const useTwitterStateStore = createSelectors(useTwitterStateBase);
