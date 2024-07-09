import { t, Trans } from '@lingui/macro';
import { compact, first, uniqBy } from 'lodash-es';
import { signOut } from 'next-auth/react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileInList } from '@/components/Login/ProfileInList.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import { getProfileState } from '@/helpers/getProfileState.js';
import { isSameAccount } from '@/helpers/isSameAccount.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { isSameSession } from '@/helpers/isSameSession.js';
import { resolveSessionHolder } from '@/helpers/resolveSessionHolder.js';
import { ConfirmModalRef, LoginModalRef } from '@/modals/controls.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { Account } from '@/providers/types/Account.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import { syncAccountsFromFirefly } from '@/services/syncAccountsFromFirefly.js';
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
        SORTED_SOCIAL_SOURCES.forEach((source) => {
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
async function restoreFireflySession(account: Account, signal?: AbortSignal): Promise<void> {
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
    if (SORTED_SOCIAL_SOURCES.some((x) => getProfileState(x).currentProfile)) return;
    useFireflyStateStore.getState().clear();
    fireflySessionHolder.removeSession();
}

export interface AccountOptions {
    // set the account as the current account, default: true
    setAsCurrent?: boolean;
    // skip the belongs to check, default: false
    skipBelongsToCheck?: boolean;
    // restore accounts from firefly, default: false
    skipRestoreFireflyAccounts?: boolean;
    // restore the firefly session, default: false
    skipRestoreFireflySession?: boolean;
    // early return signal
    signal?: AbortSignal;
}

export async function addAccount(account: Account, options?: AccountOptions) {
    const {
        setAsCurrent = true,
        skipBelongsToCheck = false,
        skipRestoreFireflyAccounts = false,
        skipRestoreFireflySession = false,
        signal,
    } = options ?? {};

    const { state, sessionHolder } = getContext(account.profile.source);

    // check if the account belongs to the current firefly session
    const fireflySession = getFireflySession(account);
    const currentFireflySession = getProfileState(Source.Firefly).currentProfileSession;

    const belongsTo =
        skipBelongsToCheck || !currentFireflySession || !fireflySession
            ? true
            : isSameSession(currentFireflySession, fireflySession);

    // add account to store cause it's from the same firefly session
    if (belongsTo && account.session.type !== SessionType.Firefly) {
        state.addAccount(account, setAsCurrent);
        if (setAsCurrent) sessionHolder.resumeSession(account.session);
    }

    // restore accounts from firefly
    if (!skipRestoreFireflyAccounts && fireflySession) {
        const accountsSynced = await syncAccountsFromFirefly(fireflySession, signal);
        const accounts = (
            belongsTo ? accountsSynced : uniqBy([account, ...accountsSynced], (x) => x.profile.profileId)
        ).filter((y) => y.session.type !== SessionType.Firefly);

        if (accounts.length) {
            LoginModalRef.close();

            const confirmed = await ConfirmModalRef.openAndWaitForClose({
                title: t`Device Logged In`,
                content: (
                    <div>
                        <p className="mb-2 mt-[-8px] text-[15px] font-medium leading-normal text-lightMain">
                            {belongsTo ? (
                                <Trans>Confirm to connect your account status.</Trans>
                            ) : (
                                <Trans>
                                    You are logging into a different Firefly account. Continuing will{' '}
                                    <strong className="text-danger">overwrite</strong> your current accounts.
                                </Trans>
                            )}
                        </p>
                        <ul className="flex max-h-[192px] flex-col gap-3 overflow-auto pb-4 pt-2">
                            {accounts
                                .sort((a, b) => {
                                    const aIndex = SORTED_SOCIAL_SOURCES.indexOf(a.profile.source);
                                    const bIndex = SORTED_SOCIAL_SOURCES.indexOf(b.profile.source);
                                    return aIndex - bIndex;
                                })
                                .map(({ profile }) => (
                                    <ProfileInList
                                        key={profile.profileId}
                                        selected
                                        selectable={false}
                                        profile={profile}
                                        ProfileAvatarProps={{
                                            enableSourceIcon: true,
                                        }}
                                    />
                                ))}
                        </ul>
                        <div className="flex gap-2">
                            <ClickableButton
                                className="flex flex-1 items-center justify-center rounded-full border border-main py-2 font-bold text-main"
                                onClick={() => ConfirmModalRef.close(false)}
                            >
                                <Trans>Skip for now</Trans>
                            </ClickableButton>
                            <ClickableButton
                                className="flex flex-1 items-center justify-center rounded-full bg-main py-2 font-bold text-primaryBottom"
                                disabled={compact(Object.values(accounts)).length === 0}
                                onClick={() => ConfirmModalRef.close(true)}
                            >
                                <Trans>Login</Trans>
                            </ClickableButton>
                        </div>
                    </div>
                ),
                enableCancelButton: false,
                enableConfirmButton: false,
                enableCloseButton: false,
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

    // restore firefly session
    if (!skipRestoreFireflySession) await restoreFireflySession(account, signal);

    // account has been added to the store
    return true;
}

/**
 * Alias of addAccount
 * @param account
 * @param signal
 */
export async function switchAccount(account: Account, signal?: AbortSignal) {
    const { state, sessionHolder } = getContext(account.profile.source);

    state.addAccount(account, true);
    sessionHolder.resumeSession(account.session);
}

export async function removeAccount(account: Account, signal?: AbortSignal) {
    const { state, sessionHolder } = getContext(account.profile.source);

    // switch to next available account if the current account is removing.
    if (isSameProfile(state.currentProfile, account.profile)) {
        const nextAccount = state.accounts.find((x) => !isSameAccount(account, x));
        if (nextAccount) await switchAccount(nextAccount, signal);
        else sessionHolder.removeSession();
    }

    state.removeAccount(account);
}

export async function removeCurrentAccount(source: SocialSource) {
    const { accounts, currentProfile } = getProfileState(source);
    const account = accounts.find((x) => isSameProfile(x.profile, currentProfile));
    if (!account) return;

    if (source === Source.Twitter) {
        await signOut({
            redirect: false,
        });
    }
    await removeAccount(account);
    await removeFireflyAccountIfNeeded();
}

export async function removeAllAccounts() {
    SORTED_SOCIAL_SOURCES.forEach(async (x) => {
        const state = getProfileState(x);
        if (!state.accounts.length) return;

        if (x === Source.Twitter) {
            await signOut({
                redirect: false,
            });
        }
        state.clear();
        resolveSessionHolder(x)?.removeSession();
    });

    await removeFireflyAccountIfNeeded();
}
