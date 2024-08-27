import { ZERO_ADDRESS } from '@masknet/web3-shared-evm';
import { create } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { queryClient } from '@/configs/queryClient.js';
import { AsyncStoreStatus, Source } from '@/constants/enum.js';
import { FetchError } from '@/constants/error.js';
import { EMPTY_LIST, HIDDEN_SECRET, THIRTY_DAYS } from '@/constants/index.js';
import { addAccount } from '@/helpers/account.js';
import { bom } from '@/helpers/bom.js';
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
import { LensSession } from '@/providers/lens/Session.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import { twitterSessionHolder } from '@/providers/twitter/SessionHolder.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { Account } from '@/providers/types/Account.js';
import type { Session } from '@/providers/types/Session.js';
import type { Profile, ProfileEditable } from '@/providers/types/SocialMedia.js';
import { bindOrRestoreFireflySession } from '@/services/bindOrRestoreFireflySession.js';
import { restoreFireflySessionAll } from '@/services/restoreFireflySession.js';

export interface ProfileState {
    status: AsyncStoreStatus;
    accounts: Account[];
    currentProfile: Profile | null;
    currentProfileSession: Session | null;
    addAccount: (account: Account, setAsCurrent: boolean) => void;
    removeAccount: (account: Account) => void;
    updateAccounts: (accounts: Account[]) => void;
    updateCurrentAccount: (account: Account) => void;
    resetCurrentAccount: () => void;
    refreshAccounts: () => void;
    refreshCurrentAccount: () => Promise<void>;
    updateCurrentProfile: (profile: ProfileEditable) => void;
    transit: (status: AsyncStoreStatus) => void;
    upgrade: () => void;
    clear: () => void;
}

export interface ProfileStatePersisted {
    status: AsyncStoreStatus;
    accounts: Account[];
    currentProfile: Profile | null;
    currentProfileSession: Session | null;
}

function createState(
    provider: {
        getUpdatedProfile?: (profile: Profile) => Promise<Profile | null>;
        getAccessToken?: () => Promise<string>;
        getRefreshToken?: () => Promise<string>;
        getWalletAddress?: () => Promise<string | null>;
    },
    options: PersistOptions<ProfileState, ProfileStatePersisted>,
) {
    return create<ProfileState, [['zustand/persist', unknown], ['zustand/immer', unknown]]>(
        persist(
            immer<ProfileState>((set, get) => ({
                status: AsyncStoreStatus.Idle,
                accounts: EMPTY_LIST,
                currentProfile: null,
                currentProfileSession: null,
                addAccount: (account, setAsCurrent) =>
                    set((state) => {
                        const account_ = state.accounts.find((x) => isSameAccount(x, account));

                        if (!account_) {
                            // add the new account at the end
                            state.accounts = [...state.accounts, account];
                        } else {
                            // replace the original account with the new one
                            state.accounts = state.accounts.map((x) => (isSameAccount(x, account) ? account : x));
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
                updateCurrentProfile: (params) =>
                    set((state) => {
                        if (state.currentProfile) {
                            if (params.pfp) state.currentProfile.pfp = params.pfp;
                            if (typeof params.displayName === 'string')
                                state.currentProfile.displayName = params.displayName;
                            if (typeof params.bio === 'string') state.currentProfile.bio = params.bio;
                            if (typeof params.location === 'string') state.currentProfile.location = params.location;
                            if (typeof params.website === 'string') state.currentProfile.website = params.website;
                        }
                    }),
                resetCurrentAccount: () =>
                    set((state) => {
                        if (!state.currentProfile) return;
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

                    const accessToken = await provider.getAccessToken?.();
                    const refreshToken = await provider.getRefreshToken?.();
                    const address = await provider.getWalletAddress?.();

                    const now = Date.now();
                    const session =
                        accessToken && refreshToken && address
                            ? new LensSession(
                                  updatedProfile.profileId,
                                  accessToken,
                                  now,
                                  now + THIRTY_DAYS,
                                  refreshToken,
                                  address ?? ZERO_ADDRESS,
                              )
                            : null;

                    set((state) => {
                        state.currentProfile = updatedProfile;
                        if (session) state.currentProfileSession = session;
                    });
                },
                transit: (status) =>
                    set((state) => {
                        state.status = status;
                    }),
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
                    status: state?.status ?? AsyncStoreStatus.Idle,
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
            if (!bom.window || !state) return;

            state.upgrade();

            if (state.currentProfileSession) {
                const farcasterSession = state.currentProfileSession as FarcasterSession;
                farcasterSessionHolder.resumeSession(farcasterSession);
            }
        },
    },
);

const useLensStateBase = createState(
    {
        getUpdatedProfile: (profile: Profile) => LensSocialMediaProvider.getProfileByHandle(profile.handle),
        getAccessToken: async () => {
            const result = await lensSessionHolder.sdk.authentication.getAccessToken();
            return result.unwrap();
        },
        getRefreshToken: async () => {
            const result = await lensSessionHolder.sdk.authentication.getRefreshToken();
            return result.unwrap();
        },
        getWalletAddress: () => lensSessionHolder.sdk.authentication.getWalletAddress(),
    },
    {
        name: 'lens-state',
        onRehydrateStorage: () => async (state) => {
            if (!bom.window || !state) return;

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
            if (!bom.window || !state) return;

            state.upgrade();

            try {
                const session = state.currentProfileSession as TwitterSession | null;

                // clean the local store if the consumer secret is not hidden
                if (session?.payload.consumerSecret && session.payload.consumerSecret !== HIDDEN_SECRET) {
                    state.clear();
                    return;
                }

                // set session for getProfileById
                if (session) twitterSessionHolder.resumeSession(session);

                const sessionFromServer = await TwitterSocialMediaProvider.login();
                const isSessionFromServer = session === null && sessionFromServer !== null;

                // show indicator if the session is from the server
                if (isSessionFromServer) state.transit(AsyncStoreStatus.Pending);

                const payload = session?.payload ?? sessionFromServer;
                const profile = payload ? await TwitterSocialMediaProvider.getProfileById(payload.clientId) : null;

                if (!profile || !payload) {
                    console.warn('[twitter store] clean the local store because no session found from the server.');
                    state.clear();
                    twitterSessionHolder.removeSession();
                    return;
                }

                const twitterSession = TwitterSession.from(profile, payload);

                const added = await addAccount(
                    {
                        profile,
                        session: twitterSession,
                        fireflySession: isSessionFromServer
                            ? await bindOrRestoreFireflySession(twitterSession)
                            : undefined,
                    },
                    {
                        skipBelongsToCheck: !isSessionFromServer,
                        skipResumeFireflyAccounts: !isSessionFromServer,
                        skipResumeFireflySession: !isSessionFromServer,
                        skipUploadFireflySession: !isSessionFromServer,
                    },
                );
            } catch (error) {
                if (error instanceof FetchError) return;
                state.clear();
                twitterSessionHolder.removeSession();
            } finally {
                state.transit(AsyncStoreStatus.Idle);
            }
        },
    },
);

const useFireflyStateBase = createState(
    {},
    {
        name: 'firefly-state',
        onRehydrateStorage: () => async (state) => {
            if (!bom.window || !state) return;

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
