import { first, uniqBy } from 'lodash-es';
import { signOut } from 'next-auth/react';

import { type ProfileSource, type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import { getProfileSessionsAll, getProfileState } from '@/helpers/getProfileState.js';
import { isSameAccount } from '@/helpers/isSameAccount.js';
import { isSameProfile, toProfileId } from '@/helpers/isSameProfile.js';
import { isSameSession } from '@/helpers/isSameSession.js';
import { resolveSessionHolder, resolveSessionHolderFromProfileSource } from '@/helpers/resolveSessionHolder.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { ConfirmFireflyModalRef, LoginModalRef } from '@/modals/controls.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import {
    captureAccountCreateSuccessEvent,
    captureAccountLoginEvent,
    captureAccountLogoutAllEvent,
    captureAccountLogoutEvent,
} from '@/providers/telemetry/captureAccountEvent.js';
import { captureActivityLoginEvent } from '@/providers/telemetry/captureActivityEvent.js';
import { captureSyncModalEvent } from '@/providers/telemetry/captureSyncModalEvent.js';
import { TwitterAuthProvider } from '@/providers/twitter/Auth.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import { twitterSessionHolder } from '@/providers/twitter/SessionHolder.js';
import type { Account } from '@/providers/types/Account.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import { downloadAccounts, downloadSessions, uploadSessions } from '@/services/metrics.js';
import { restoreFireflySession } from '@/services/restoreFireflySession.js';
import { usePreferencesState } from '@/store/usePreferenceStore.js';
import { useFireflyStateStore, useThirdPartyStateStore } from '@/store/useProfileStore.js';

function getContext(source: ProfileSource) {
    return {
        state: getProfileState(source),
        sessionHolder: resolveSessionHolderFromProfileSource(source),
    };
}

function getFireflySession(account: Account) {
    if (account.session.type === SessionType.Firefly) {
        if (!account.session) throw new Error('Firefly session is not found');
        return account.session as FireflySession;
    }
    return account.fireflySession;
}

function hasFireflySession() {
    return SORTED_SOCIAL_SOURCES.some((x) => !!getProfileState(x).currentProfile);
}

async function updateState(accounts: Account[], overwrite = false) {
    // remove all accounts if overwrite is true
    if (overwrite) {
        await Promise.all(
            SORTED_SOCIAL_SOURCES.map(async (source) => {
                const { state, sessionHolder } = getContext(source);

                // sign out from twitter if the next auth session is found
                if (source === Source.Twitter && state.accounts.some((x) => TwitterSession.isNextAuth(x.session))) {
                    await signOut({
                        redirect: false,
                    });
                }

                state.resetCurrentAccount();
                state.updateAccounts([]);
                sessionHolder.removeSession();
            }),
        );

        const thirdPartyState = useThirdPartyStateStore.getState();
        const thirdPartyAccounts = thirdPartyState.accounts;

        if (thirdPartyAccounts.length) {
            thirdPartyState.resetCurrentAccount();
            thirdPartyState.updateAccounts([]);
            signOut({
                redirect: false,
            });
        }
    }

    // add accounts to the store
    accounts.forEach((account) => {
        const { state } = getContext(account.profile.profileSource);
        state.addAccount(account, false);
    });

    // set the first account as the current account if no current account is set
    await Promise.all(
        SORTED_SOCIAL_SOURCES.map(async (x) => {
            const { state, sessionHolder } = getContext(x);

            const account = first(state.accounts);
            if (!account) return;

            if (!state.currentProfile) state.updateCurrentAccount(account);
            if (!sessionHolder?.session) {
                sessionHolder?.resumeSession(account.session);

                if (x === Source.Twitter && TwitterSession.isNextAuth(account.session)) {
                    await TwitterAuthProvider.login();
                }
            }
        }),
    );
}

/**
 * Restore firefly session from social account sessions
 * @param session
 * @param signal
 */
async function resumeFireflySession(account: Account, signal?: AbortSignal): Promise<void> {
    const fireflySession = getFireflySession(account) ?? (await restoreFireflySession(account.session, signal));
    const fireflyAccount = {
        profile: createDummyProfile(Source.Farcaster),
        session: fireflySession,
    } satisfies Account;

    // update firefly state
    const state = getProfileState(Source.Firefly);
    state.updateAccounts([fireflyAccount]);
    state.updateCurrentAccount(fireflyAccount);

    // restore firefly session
    fireflySessionHolder.resumeSession(fireflyAccount.session);
}

/**
 * Remove firefly account if no other social account is logged in
 * @returns
 */
async function removeFireflyAccountIfNeeded() {
    if (hasFireflySession()) return;
    useFireflyStateStore.getState().clear();
    usePreferencesState.getState().resetPreferences();
    fireflySessionHolder.removeSession();
}

async function removeFireflyMetricsIfNeeded(sessions: Session[], signal?: AbortSignal) {
    const session = useFireflyStateStore.getState().currentProfileSession as FireflySession | null;
    if (!session) return;

    const downloadedSessions = await downloadSessions(session, signal);
    const filteredSessions = downloadedSessions.filter((x) => !sessions.find((y) => isSameSession(x, y)));
    await uploadSessions('override', session, filteredSessions, signal);
}

export interface AccountOptions {
    // set the account as the current account, default: true
    setAsCurrent?: boolean;
    // skip the belongs to check, default: false
    skipBelongsToCheck?: boolean;
    // skip updating metrics, default: false
    skipUploadFireflySession?: boolean;
    // resume accounts from firefly, default: false
    skipResumeFireflyAccounts?: boolean;
    // resume the firefly session, default: false
    skipResumeFireflySession?: boolean;
    // skip reporting farcaster signer, default: true
    skipReportFarcasterSigner?: boolean;
    // early return signal
    signal?: AbortSignal;
}

export async function addAccount(account: Account, options?: AccountOptions) {
    const {
        setAsCurrent = true,
        skipBelongsToCheck = false,
        skipResumeFireflyAccounts = false,
        skipResumeFireflySession = false,
        skipUploadFireflySession = false,
        skipReportFarcasterSigner = true,
        signal,
    } = options ?? {};

    const { state, sessionHolder } = getContext(account.profile.profileSource);

    const fireflySession = getFireflySession(account);
    const currentFireflySession = getProfileState(Source.Firefly).currentProfileSession;

    // check if the account belongs to the current firefly session
    const belongsTo =
        skipBelongsToCheck || !fireflySession || !currentFireflySession || !hasFireflySession()
            ? true
            : isSameSession(currentFireflySession, fireflySession);

    if (!belongsTo) {
        console.warn('[account] account does not belong to the current firefly session.', {
            account,
            fireflySession,
            currentFireflySession,
        });
    }

    // resume accounts from firefly
    if (!skipResumeFireflyAccounts && fireflySession) {
        const accountsSynced = await downloadAccounts(fireflySession, signal);
        const accountsFiltered = accountsSynced.filter((x) => {
            const state = getProfileState(x.profile.profileSource);
            return !state.accounts.find((y) => isSameAccount(x, y)) && !isSameAccount(x, account);
        });
        const accounts = (
            belongsTo ? accountsFiltered : uniqBy([account, ...accountsFiltered], (x) => toProfileId(x.profile))
        ).filter((y) => y.session.type !== SessionType.Firefly);

        if (accounts.length) {
            LoginModalRef.close();

            const confirmed = await ConfirmFireflyModalRef.openAndWaitForClose({
                belongsTo,
                accounts,
            });

            captureSyncModalEvent(fireflySession.profileId, confirmed);

            if (confirmed) {
                await updateState(accounts, !belongsTo);
            } else {
                // sign out tw from server if needed
                if (TwitterSession.isNextAuth(account.session)) {
                    await signOut({
                        redirect: false,
                    });
                }

                // the user rejected to store conflicting accounts
                if (!belongsTo) return false;

                // the user rejected to restore accounts from firefly
                if (account.session.type === SessionType.Firefly) return false;
            }
        }
    }

    // add account to store cause it's from the same firefly session
    if (belongsTo && account.session.type !== SessionType.Firefly) {
        state.addAccount(account, setAsCurrent);
        if (setAsCurrent) sessionHolder.resumeSession(account.session);
    }

    // resume firefly session
    if (!skipResumeFireflySession) {
        console.warn('[addAccount] resume firefly session');
        await resumeFireflySession(account, signal);
    }

    await runInSafeAsync(async () => {
        // upload sessions to firefly
        if (!skipUploadFireflySession && belongsTo && account.session.type !== SessionType.Firefly) {
            console.warn('[addAccount] upload sessions to firefly');
            await uploadSessions('merge', fireflySessionHolder.sessionRequired, getProfileSessionsAll());
        }
    });

    await runInSafeAsync(async () => {
        // report farcaster signer
        if (
            !skipReportFarcasterSigner &&
            account.session.type === SessionType.Farcaster &&
            fireflySessionHolder.session
        ) {
            console.warn('[addAccount] report farcaster signer');
            await FireflyEndpointProvider.reportFarcasterSigner(account.session as FireflySession);
        }
    });

    captureAccountLoginEvent(account);
    captureActivityLoginEvent(account);
    if (account.fireflySession?.isNew) captureAccountCreateSuccessEvent(account);

    // account has been added to the store
    return true;
}

/**
 * Restore accounts from the currently logged-in Firefly session.
 * @param signal
 * @returns
 */
export async function restoreCurrentAccounts(signal?: AbortSignal) {
    const session = fireflySessionHolder.session;
    if (!session) return false;

    const accountsSynced = await downloadAccounts(session, signal);
    const accountsFiltered = accountsSynced.filter((x) => {
        const state = getProfileState(x.profile.profileSource);
        return !state.accounts.find((y) => isSameAccount(x, y));
    });

    if (accountsFiltered.length) {
        LoginModalRef.close();

        const confirmed = await ConfirmFireflyModalRef.openAndWaitForClose({
            belongsTo: true,
            accounts: accountsFiltered,
        });

        captureSyncModalEvent(session.profileId, confirmed);

        if (confirmed) {
            await updateState(accountsFiltered, false);
            return true;
        }
    }
    return false;
}

export async function switchAccount(account: Account, signal?: AbortSignal) {
    const { state, sessionHolder } = getContext(account.profile.profileSource);

    state.addAccount(account, true);
    sessionHolder.resumeSession(account.session);
}

async function removeAccount(account: Account, signal?: AbortSignal) {
    const { state, sessionHolder } = getContext(account.profile.profileSource);

    // switch to next available account if the current account is removing.
    if (isSameProfile(state.currentProfile, account.profile)) {
        const nextAccount = state.accounts.find((x) => !isSameAccount(account, x));
        if (nextAccount) {
            await switchAccount(nextAccount, signal);
            state.removeAccount(account);
        } else {
            state.removeAccount(account);
            sessionHolder.removeSession();
        }
    } else {
        state.removeAccount(account);
    }

    runInSafeAsync(async () => {
        if (TwitterSession.isNextAuth(account.session)) {
            await signOut({
                redirect: false,
            });
            twitterSessionHolder.removeSession();
        }
    });
    captureAccountLogoutEvent(account);
}

export async function removeAccountByProfileId(source: ProfileSource, profileId: string) {
    const { accounts } = getProfileState(source);
    const account = accounts.find((x) => x.profile.profileId === profileId);
    if (!account) {
        console.warn(`[removeAccountByProfileId] Account not found: ${profileId}`);
        return;
    }

    await removeAccount(account);
    await removeFireflyAccountIfNeeded();
    await removeFireflyMetricsIfNeeded([account.session]);
}

export async function removeCurrentAccount(source: SocialSource) {
    const { currentProfile } = getProfileState(source);
    if (!currentProfile) {
        console.warn(`[removeCurrentAccount] Current account not found: ${source}`);
        return;
    }

    await removeAccountByProfileId(source, currentProfile.profileId);
}

export async function removeAllAccounts() {
    const allAccounts = SORTED_SOCIAL_SOURCES.flatMap((x) => getProfileState(x).accounts);

    SORTED_SOCIAL_SOURCES.forEach(async (x) => {
        const state = getProfileState(x);
        if (!state.accounts.length) return;

        const hasTwitterSession = state.accounts.some((x) => TwitterSession.isNextAuth(x.session));

        state.clear();
        resolveSessionHolder(x)?.removeSession();

        if (hasTwitterSession) {
            await signOut({
                redirect: false,
            });
        }
    });

    await removeFireflyAccountIfNeeded();

    captureAccountLogoutAllEvent(allAccounts);
}
