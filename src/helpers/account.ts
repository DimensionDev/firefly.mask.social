import { first, uniqBy } from 'lodash-es';
import { signOut } from 'next-auth/react';

import { type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import { getProfileSessionsAll, getProfileState } from '@/helpers/getProfileState.js';
import { isSameAccount } from '@/helpers/isSameAccount.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { isSameSession } from '@/helpers/isSameSession.js';
import { resolveSessionHolder } from '@/helpers/resolveSessionHolder.js';
import { ConfirmFireflyModalRef, LoginModalRef } from '@/modals/controls.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import type { Account } from '@/providers/types/Account.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import { downloadAccounts, uploadSessions } from '@/services/metrics.js';
import { useFireflyStateStore } from '@/store/useProfileStore.js';

function getContext(source: SocialSource) {
    return {
        state: getProfileState(source),
        sessionHolder: resolveSessionHolder(source),
    };
}

function getFireflySession(account: Account) {
    if (account.session.type === SessionType.Firefly) {
        if (!account.session) throw new Error('Firefly session is not found');
        return account.session as FireflySession;
    }
    return account.fireflySession;
}

async function updateState(accounts: Account[], overwrite = false) {
    // remove all accounts if overwrite is true
    if (overwrite) {
        SORTED_SOCIAL_SOURCES.map(async (source) => {
            // we haven't supported to sync ffid with a twitter account
            if (source === Source.Twitter) return;

            const { state, sessionHolder } = getContext(source);
            state.resetCurrentAccount();
            state.updateAccounts([]);
            sessionHolder.removeSession();
        });
    }

    // add accounts to the store
    accounts.forEach((account) => {
        const { state } = getContext(account.profile.source);
        state.addAccount(account, false);
    });

    // set the first account as the current account if no current account is set
    SORTED_SOCIAL_SOURCES.map((x) => {
        const { state, sessionHolder } = getContext(x);

        const account = first(state.accounts);
        if (!account) return;

        if (!state.currentProfile) state.updateCurrentAccount(account);
        if (!sessionHolder?.session) sessionHolder?.resumeSession(account.session);
    });
}

/**
 * Restore firefly session from social account sessions
 * @param session
 * @param signal
 */
async function resumeFireflySession(account: Account, signal?: AbortSignal): Promise<void> {
    const fireflySession = getFireflySession(account) ?? (await FireflySession.from(account.session, signal));
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
    // ffid doesn't take twitter profile into account
    if (SORTED_SOCIAL_SOURCES.some((x) => (x === Source.Twitter ? false : getProfileState(x).currentProfile))) return;
    useFireflyStateStore.getState().clear();
    fireflySessionHolder.removeSession();
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
        signal,
    } = options ?? {};

    const { state, sessionHolder } = getContext(account.profile.source);

    const fireflySession = getFireflySession(account);
    const currentFireflySession = getProfileState(Source.Firefly).currentProfileSession;

    // check if the account belongs to the current firefly session
    const belongsTo =
        skipBelongsToCheck || !currentFireflySession || !fireflySession
            ? true
            : isSameSession(currentFireflySession, fireflySession);

    // add account to store cause it's from the same firefly session
    if (belongsTo && account.session.type !== SessionType.Firefly) {
        state.addAccount(account, setAsCurrent);
        if (setAsCurrent) sessionHolder.resumeSession(account.session);
    }

    // resume accounts from firefly
    if (!skipResumeFireflyAccounts && fireflySession) {
        const accountsSynced = await downloadAccounts(fireflySession, signal);
        const accountsFiltered = accountsSynced.filter((x) => {
            const state = getProfileState(x.profile.source);
            return !state.accounts.find((y) => isSameAccount(x, y));
        });
        const accounts = (
            belongsTo ? accountsFiltered : uniqBy([account, ...accountsFiltered], (x) => x.profile.profileId)
        ).filter((y) => y.session.type !== SessionType.Firefly);

        if (accounts.length) {
            LoginModalRef.close();

            const confirmed = await ConfirmFireflyModalRef.openAndWaitForClose({
                belongsTo,
                accounts,
            });

            if (confirmed) {
                await updateState(accounts, !belongsTo);
            } else {
                // the user rejected to store conflicting accounts
                if (!belongsTo) return false;

                // the user rejected to restore accounts from firefly
                if (account.session.type === SessionType.Firefly) return false;
            }
        }
    }

    // resume firefly session
    if (!skipResumeFireflySession) await resumeFireflySession(account, signal);

    // upload sessions to firefly
    if (!skipUploadFireflySession && belongsTo && account.session.type !== SessionType.Firefly) {
        await uploadSessions(fireflySessionHolder.sessionRequired, getProfileSessionsAll(), signal);
    }

    // account has been added to the store
    return true;
}

export async function switchAccount(account: Account, signal?: AbortSignal) {
    const { state, sessionHolder } = getContext(account.profile.source);

    state.addAccount(account, true);
    sessionHolder.resumeSession(account.session);
}

async function removeAccount(account: Account, signal?: AbortSignal) {
    const { state, sessionHolder } = getContext(account.profile.source);

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
}

export async function removeCurrentAccount(source: SocialSource) {
    const { accounts, currentProfile } = getProfileState(source);
    const account = accounts.find((x) => isSameProfile(x.profile, currentProfile));
    if (!account) return;

    await removeAccount(account);
    await removeFireflyAccountIfNeeded();

    if (TwitterSession.isNextAuth(account.session)) {
        await signOut({
            redirect: false,
        });
    }
}

export async function removeAllAccounts() {
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
}
