'use client';
import { t } from '@lingui/macro';
import { getSession, signOut } from 'next-auth/react';
import { create } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { queryClient } from '@/configs/queryClient.js';
import { AsyncStatus, Source } from '@/constants/enum.js';
import { FetchError } from '@/constants/error.js';
import { EMPTY_LIST, HIDDEN_SECRET } from '@/constants/index.js';
import { bom } from '@/helpers/bom.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { createSessionStorage } from '@/helpers/createSessionStorage.js';
import { enqueueMessageFromError, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { isSameAccount } from '@/helpers/isSameAccount.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { isSameSession, isSameSessionPayload } from '@/helpers/isSameSession.js';
import { resolveSourceFromSessionType } from '@/helpers/resolveSource.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import type { FireflySession } from '@/providers/firefly/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { ThirdPartySession } from '@/providers/third-party/Session.js';
import { thirdPartySessionHolder } from '@/providers/third-party/SessionHolder.js';
import { TwitterAuthProvider } from '@/providers/twitter/Auth.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import { twitterSessionHolder } from '@/providers/twitter/SessionHolder.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { Account } from '@/providers/types/Account.js';
import type { Session } from '@/providers/types/Session.js';
import { type Profile, type ProfileEditable, ProfileStatus, SessionType } from '@/providers/types/SocialMedia.js';
import type { ThirdPartySessionType } from '@/providers/types/ThirdParty.js';
import { addAccount } from '@/services/account.js';
import { bindOrRestoreFireflySession } from '@/services/bindFireflySession.js';
import { restoreFireflySessionAll } from '@/services/restoreFireflySession.js';

export interface ProfileState {
    // indicate the store is ready or not
    status: AsyncStatus;
    // internally used in this store
    __setStatus__: (status: AsyncStatus) => void;

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
    upgrade: () => void;
    clear: () => void;
}

export interface ProfileStatePersisted {
    status: AsyncStatus;
    accounts: Account[];
    currentProfile: Profile | null;
    currentProfileSession: Session | null;
}

function createState(
    provider: {
        getUpdatedProfile?: (profile: Profile) => Promise<Profile | null>;
        refreshCurrentAccountSession?: () => Promise<Session | null>;
    },
    options: PersistOptions<ProfileState, ProfileStatePersisted>,
) {
    return create<ProfileState, [['zustand/persist', unknown], ['zustand/immer', unknown]]>(
        persist(
            immer<ProfileState>((set, get) => ({
                status: AsyncStatus.Idle,
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

                    const session = await provider.refreshCurrentAccountSession?.();

                    const updatedProfile = await provider.getUpdatedProfile?.(profile);
                    if (!updatedProfile) return;

                    set((state) => {
                        state.currentProfile = updatedProfile;
                        if (session) state.currentProfileSession = session;
                        state.accounts = state.accounts.map((x) => {
                            if (isSameProfile(x.profile, profile)) {
                                return {
                                    profile: updatedProfile,
                                    session: session ?? x.session,
                                };
                            }
                            return x;
                        });
                    });
                },
                __setStatus__: (status) =>
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
                    status: state?.status ?? AsyncStatus.Idle,
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
        refreshCurrentAccountSession: () => lensSessionHolder.refreshSession(),
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
            if (!bom.window || !state || bom.location?.pathname.includes('/telegram/login')) return;

            state.upgrade();

            try {
                const session = state.currentProfileSession as TwitterSession | null;

                // clean the local store if the consumer secret is not hidden
                if (session?.payload.consumerSecret && session.payload.consumerSecret !== HIDDEN_SECRET) {
                    state.clear();
                    return;
                }

                // set temporary session for getProfileById
                if (session) twitterSessionHolder.resumeSession(session);

                const sessionPayloadFromServer = await TwitterAuthProvider.login();
                const foundNewSessionFromServer = !!(
                    sessionPayloadFromServer &&
                    !state.accounts.some((x) =>
                        isSameSessionPayload(sessionPayloadFromServer, (x.session as TwitterSession).payload),
                    )
                );

                // show indicator if the session is from the server
                if (foundNewSessionFromServer) state.__setStatus__(AsyncStatus.Pending);

                const payload = foundNewSessionFromServer ? sessionPayloadFromServer : (session?.payload ?? null);
                const profile = payload ? await TwitterSocialMediaProvider.getProfileById(payload.clientId) : null;

                if (!profile || !payload) {
                    console.warn('[twitter store] clean the local store because no session found from the server.');
                    state.clear();
                    twitterSessionHolder.removeSession();
                    return;
                }

                runInSafeAsync(async () => {
                    const badges = await TwitterSocialMediaProvider.getProfileBadges(profile);
                    if (badges.length > 0) profile.verified = true;
                });

                const twitterSession = TwitterSession.from(profile.profileId, payload);

                await addAccount(
                    {
                        profile,
                        session: twitterSession,
                        fireflySession: foundNewSessionFromServer
                            ? await bindOrRestoreFireflySession(twitterSession)
                            : undefined,
                    },
                    {
                        skipBelongsToCheck: !foundNewSessionFromServer,
                        skipResumeFireflyAccounts: !foundNewSessionFromServer,
                        skipResumeFireflySession: !foundNewSessionFromServer,
                        skipUploadFireflySession: !foundNewSessionFromServer,
                    },
                );
            } catch (error) {
                if (error instanceof FetchError) return;
                state.clear();
                twitterSessionHolder.removeSession();
            } finally {
                state.__setStatus__(AsyncStatus.Idle);
            }
        },
    },
);

const useThirdPartyStateBase = createState(
    {},
    {
        name: 'third-party-state',
        onRehydrateStorage: () => async (state) => {
            if (!bom.window || !state || bom.location?.pathname.includes('/telegram/login')) return;

            state.upgrade();

            try {
                const session = (await getSession()) as unknown as ThirdPartySessionType;
                if (!session?.user || session.type === SessionType.Twitter) return;

                const thirdPartySession = session.user?.id
                    ? new ThirdPartySession(
                          session.type,
                          session.user.id,
                          session.id_token,
                          session.createdAt,
                          session.expiresAt,
                          {
                              nonce: session.nonce,
                          },
                      )
                    : null;

                if (!thirdPartySession) return;

                const foundNewSessionFromServer = !!(
                    thirdPartySession &&
                    !state.accounts.some((x) => isSameSession(thirdPartySession, x.session as ThirdPartySession))
                );

                if (!foundNewSessionFromServer) return;

                state.__setStatus__(AsyncStatus.Pending);

                const result = await addAccount(
                    {
                        profile: {
                            profileId: session.user?.id ?? '',
                            displayName: session.user?.email ?? '',
                            handle: session.user?.email ?? '',
                            fullHandle: session.user.email ?? '',
                            pfp: session.user?.image ?? '',
                            followerCount: 0,
                            followingCount: 0,
                            status: ProfileStatus.Active,
                            source: Source.Farcaster,
                            profileSource: resolveSourceFromSessionType(session.type),
                            verified: true,
                        },
                        session: thirdPartySession,
                        fireflySession: foundNewSessionFromServer
                            ? await bindOrRestoreFireflySession(thirdPartySession)
                            : undefined,
                    },
                    {
                        skipBelongsToCheck: !foundNewSessionFromServer,
                        skipResumeFireflyAccounts: !foundNewSessionFromServer,
                        skipResumeFireflySession: !foundNewSessionFromServer,
                        skipUploadFireflySession: !foundNewSessionFromServer,
                    },
                );

                if (!result) return;

                enqueueSuccessMessage(t`Your ${session.type} account is now connected`);
            } catch (error) {
                if (error instanceof Error && error.message.includes('This apple already bound to the other account'))
                    return;

                enqueueMessageFromError(error, t`Oops... Something went wrong. Please try again`);
                state.clear();
                signOut({ redirect: false });
                thirdPartySessionHolder.removeSession();
            } finally {
                state.__setStatus__(AsyncStatus.Idle);
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
export const useThirdPartyStateStore = createSelectors(useThirdPartyStateBase);
export const useFireflyStateStore = createSelectors(useFireflyStateBase);
