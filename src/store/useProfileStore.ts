import { EMPTY_LIST } from '@masknet/shared-base';
import { create } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { queryClient } from '@/configs/queryClient.js';
import { Source } from '@/constants/enum.js';
import { HIDDEN_SECRET } from '@/constants/index.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { createSessionStorage } from '@/helpers/createSessionStorage.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { restoreAccount } from '@/helpers/restoreAccount.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import type { FireflySession } from '@/providers/firefly/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import { twitterSessionHolder } from '@/providers/twitter/SessionHolder.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { Account } from '@/providers/types/Account.js';
import type { Session } from '@/providers/types/Session.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { resolveFireflySessionAll } from '@/services/restoreFireflySession.js';

export interface ProfileState {
    accounts: Account[];
    currentProfile: Profile | null;
    currentProfileSession: Session | null;
    updateAccounts: (accounts: Account[]) => void;
    updateCurrentAccount: (account: Account) => void;
    refreshAccounts: () => void;
    refreshCurrentAccount: () => void;
    clear: () => void;
}

export interface ProfileStatePersisted {
    accounts: Account[];
    currentProfile: Profile | null;
    currentProfileSession: Session | null;
}

function createState(
    provider: {
        getUpdatedProfile?: (profile: Profile) => Promise<Profile | null>;
    },
    options: PersistOptions<ProfileState, ProfileStatePersisted>,
) {
    return create<ProfileState, [['zustand/persist', unknown], ['zustand/immer', unknown]]>(
        persist(
            immer<ProfileState>((set, get) => ({
                accounts: EMPTY_LIST,
                currentProfile: null,
                currentProfileSession: null,
                updateAccounts: (accounts) =>
                    set((state) => {
                        state.accounts = accounts;
                    }),
                updateCurrentAccount: (account) =>
                    set((state) => {
                        state.currentProfile = account.profile;
                        state.currentProfileSession = account.session;
                    }),
                refreshAccounts: async () => {
                    const profile = get().currentProfile;
                    const accounts = get().accounts;

                    const updatedRecords = await Promise.all(
                        accounts.map(async (account) => {
                            const profile = await provider.getUpdatedProfile?.(account.profile);
                            if (!profile) return account;
                            return {
                                profile,
                                session: account.session,
                            };
                        }),
                    );
                    if (!updatedRecords.length) return;

                    // might be logged out
                    const profileSession = get().currentProfileSession;
                    if (!profileSession) return;

                    set((state) => {
                        const account = accounts.find((x) => isSameProfile(x.profile, profile));
                        if (account) state?.updateCurrentAccount?.(account);
                        state.updateAccounts(updatedRecords);
                    });
                },
                refreshCurrentAccount: async () => {
                    const profile = get().currentProfile;
                    if (!profile) return;

                    const updatedProfile = await provider.getUpdatedProfile?.(profile);
                    if (!updatedProfile) return;

                    set((state) => {
                        state.currentProfile = updatedProfile;
                    });
                },
                clear: () =>
                    set((state) => {
                        queryClient.resetQueries({
                            queryKey: ['profile', 'is-following', Source.Farcaster],
                        });
                        state.accounts = EMPTY_LIST;
                        state.currentProfile = null;
                        state.currentProfileSession = null;
                    }),
            })),
            {
                storage: createSessionStorage(),
                partialize: (state) => ({
                    accounts: state.accounts,
                    currentProfile: state.currentProfile,
                    currentProfileSession: state.currentProfileSession,
                }),
                ...options,
            },
        ),
    );
}

const useFarcasterStateBase = createState(
    {
        getUpdatedProfile: (profile: Profile) => FarcasterSocialMediaProvider.getProfileById(profile.profileId),
    },
    {
        name: 'farcaster-state',
        onRehydrateStorage: () => async (state) => {
            if (typeof window === 'undefined') return;

            const session = state?.currentProfileSession;
            if (session) {
                farcasterSessionHolder.resumeSession(session as FarcasterSession);
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
        onRehydrateStorage: () => async (state) => {
            if (typeof window === 'undefined') return;

            const profileId = state?.currentProfile?.profileId;
            const clientProfileId = await lensSessionHolder.sdk.authentication.getProfileId();

            if (!clientProfileId || (profileId && clientProfileId !== profileId)) {
                console.warn('[lens store] clean the local store because the client cannot recover properly');
                state?.clear();
                return;
            }

            const authenticated = await lensSessionHolder.sdk.authentication.isAuthenticated();
            if (!authenticated) {
                console.warn('[lens store] clean the local profile because the client session is broken');
                state?.clear();
                return;
            }
        },
    },
);

const useTwitterStateBase = createState(
    {},
    {
        name: 'twitter-state',
        onRehydrateStorage: () => async (state) => {
            if (typeof window === 'undefined') return;

            try {
                const session = state?.currentProfileSession as TwitterSession | null;
                if (session) twitterSessionHolder.resumeSession(session);

                // clean the local store if the consumer secret is not hidden
                if (session?.payload.consumerSecret && session.payload.consumerSecret !== HIDDEN_SECRET) {
                    state?.clear();
                    return;
                }

                const payload = session ? session.payload : await TwitterSocialMediaProvider.login();
                const me = payload ? await TwitterSocialMediaProvider.getProfileById(payload.clientId) : null;

                if (!me || !payload) {
                    console.warn('[twitter store] clean the local store because no session found from the server.');
                    state?.clear();
                    return;
                }

                restoreAccount({
                    profile: me,
                    session: TwitterSession.from(me, payload),
                });
            } catch {
                state?.clear();
            }
        },
    },
);

const useFireflyStateBase = createState(
    {},
    {
        name: 'firefly-state',
        onRehydrateStorage: () => async (state) => {
            if (typeof window === 'undefined') return;

            const session = state?.currentProfileSession || (await resolveFireflySessionAll());

            if (session) {
                if (state) {
                    const profile = createDummyProfile(Source.Farcaster);
                    const account = { profile, session };

                    state.accounts = [account];
                    state.updateCurrentAccount(account);
                }
                fireflySessionHolder.resumeSession(session as FireflySession);
            } else {
                console.warn('[firefly store] clean the local store because no session found from the server.');
                state?.clear();
            }
        },
    },
);

export const useLensStateStore = createSelectors(useLensStateBase);
export const useFarcasterStateStore = createSelectors(useFarcasterStateBase);
export const useTwitterStateStore = createSelectors(useTwitterStateBase);
export const useFireflyStateStore = createSelectors(useFireflyStateBase);
