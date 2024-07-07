import { EMPTY_LIST } from '@masknet/shared-base';
import { create } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { queryClient } from '@/configs/queryClient.js';
import { Source } from '@/constants/enum.js';
import { FetchError } from '@/constants/error.js';
import { HIDDEN_SECRET } from '@/constants/index.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { createSessionStorage } from '@/helpers/createSessionStorage.js';
import { isSameAccount } from '@/helpers/isSameAccount.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
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
import { restoreFireflySessionAll } from '@/services/restoreFireflySession.js';

export interface ProfileState {
    accounts: Account[];
    currentProfile: Profile | null;
    currentProfileSession: Session | null;
    addAccount: (account: Account, setAsCurrent: boolean) => void;
    removeAccount: (account: Account) => void;
    updateAccounts: (accounts: Account[]) => void;
    updateCurrentAccount: (account: Account) => void;
    removeCurrentAccount: () => void;
    refreshAccounts: () => void;
    refreshCurrentAccount: () => void;
    upgrade: () => void;
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
                addAccount: (account, setAsCurrent) =>
                    set((state) => {
                        const account_ = state.accounts.find((x) => isSameAccount(x, account));

                        if (!account_) {
                            state.accounts = [...state.accounts, account];
                        }

                        if (setAsCurrent) {
                            state.currentProfile = account.profile;
                            state.currentProfileSession = account.session;
                        }
                    }),
                removeAccount: (account) =>
                    set((state) => {
                        state.accounts = state.accounts.filter((x) => !isSameAccount(x, account));

                        if (isSameProfile(account.profile, state.currentProfile)) {
                            state.currentProfile = null;
                            state.currentProfileSession = null;
                        }
                    }),
                updateAccounts: (accounts) =>
                    set((state) => {
                        state.accounts = accounts;
                    }),
                updateCurrentAccount: (account) =>
                    set((state) => {
                        state.currentProfile = account.profile;
                        state.currentProfileSession = account.session;

                        if (!state.accounts.length) {
                            state.accounts = [account];
                        }
                    }),
                removeCurrentAccount: () =>
                    set((state) => {
                        state.currentProfile = null;
                        state.currentProfileSession = null;
                    }),
                refreshAccounts: async () => {
                    const { currentProfile: profile, accounts } = get();
                    const updatedAccounts = await Promise.all(
                        accounts.map(async (account) => {
                            const profile = await provider.getUpdatedProfile?.(account.profile);
                            if (!profile) return account;
                            return {
                                profile,
                                session: account.session,
                            };
                        }),
                    );
                    if (!updatedAccounts.length) return;

                    // might be logged out
                    if (!get().currentProfileSession) return;

                    set((state) => {
                        const account = accounts.find((x) => isSameProfile(x.profile, profile));
                        if (account) state.updateCurrentAccount?.(account);
                        state.updateAccounts(updatedAccounts);
                    });
                },
                refreshCurrentAccount: async () => {
                    const { currentProfile: profile } = get();
                    if (!profile) return;

                    const updatedProfile = await provider.getUpdatedProfile?.(profile);
                    if (!updatedProfile) return;

                    set((state) => {
                        state.currentProfile = updatedProfile;
                    });
                },
                upgrade: () =>
                    set((state) => {
                        if (state.currentProfile && state.currentProfileSession && !state.accounts.length) {
                            state.updateCurrentAccount({
                                profile: state.currentProfile,
                                session: state.currentProfileSession,
                            });
                        }
                    }),
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
            if (typeof window === 'undefined' || !state) return;

            state.upgrade();

            if (state.currentProfileSession) {
                farcasterSessionHolder.resumeSession(state.currentProfileSession as FarcasterSession);
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
            if (typeof window === 'undefined' || !state) return;

            state.upgrade();

            try {
                const profileId = state.currentProfile?.profileId;
                const clientProfileId = await lensSessionHolder.sdk.authentication.getProfileId();

                if (!clientProfileId || (profileId && clientProfileId !== profileId)) {
                    console.warn('[lens store] clean the local store because the client cannot recover properly');
                    state.clear();
                    return;
                }

                const authenticated = await lensSessionHolder.sdk.authentication.isAuthenticated();
                if (!authenticated) {
                    console.warn('[lens store] clean the local profile because the client session is broken');
                    state.clear();
                    return;
                }
            } catch (error) {
                if (error instanceof FetchError) return;
                state.clear();
            }
        },
    },
);

const useTwitterStateBase = createState(
    {},
    {
        name: 'twitter-state',
        onRehydrateStorage: () => async (state) => {
            if (typeof window === 'undefined' || !state) return;

            state.upgrade();

            try {
                const session = state.currentProfileSession as TwitterSession | null;
                if (session) twitterSessionHolder.resumeSession(session);

                // clean the local store if the consumer secret is not hidden
                if (session?.payload.consumerSecret && session.payload.consumerSecret !== HIDDEN_SECRET) {
                    state.clear();
                    return;
                }

                const payload = await TwitterSocialMediaProvider.login();
                const me = payload ? await TwitterSocialMediaProvider.getProfileById(payload.clientId) : null;

                if (!me || !payload) {
                    console.warn('[twitter store] clean the local store because no session found from the server.');
                    state.clear();
                    return;
                }

                state.updateCurrentAccount({
                    profile: me,
                    session: TwitterSession.from(me, payload),
                });
            } catch (error) {
                if (error instanceof FetchError) return;
                state.clear();
            }
        },
    },
);

const useFireflyStateBase = createState(
    {},
    {
        name: 'firefly-state',
        onRehydrateStorage: () => async (state) => {
            if (typeof window === 'undefined' || !state) return;

            try {
                const session = state.currentProfileSession || (await restoreFireflySessionAll());

                if (session) {
                    state.updateCurrentAccount({ profile: createDummyProfile(Source.Farcaster), session });
                    fireflySessionHolder.resumeSession(session as FireflySession);
                } else {
                    console.warn('[firefly store] clean the local store because no session found.');
                    state.clear();
                }
            } catch (error) {
                if (error instanceof FetchError) return;
                state.clear();
            }
        },
    },
);

export const useLensStateStore = createSelectors(useLensStateBase);
export const useFarcasterStateStore = createSelectors(useFarcasterStateBase);
export const useTwitterStateStore = createSelectors(useTwitterStateBase);
export const useFireflyStateStore = createSelectors(useFireflyStateBase);
