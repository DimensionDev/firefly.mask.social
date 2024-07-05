import { t, Trans } from '@lingui/macro';
import { compact, first, groupBy, uniqBy } from 'lodash-es';
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
import { resolveSessionHolder, resolveSessionHolderFromSessionType } from '@/helpers/resolveSessionHolder.js';
import { resolveSocialSourceFromSessionType } from '@/helpers/resolveSource.js';
import { ConfirmModalRef, LoginModalRef } from '@/modals/controls.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { Account } from '@/providers/types/Account.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import { syncAccountsFromFirefly } from '@/services/syncAccountsFromFirefly.js';
import { useFireflyStateStore } from '@/store/useProfileStore.js';

function getContext(account: Account) {
    return {
        state: getProfileState(account.profile.source),
        sessionHolder: resolveSessionHolderFromSessionType(account.session.type),
    };
}

async function updateState(accounts: Account[], overwrite = false) {
    // remove all accounts if overwrite is true
    if (overwrite) {
        Object.entries(groupBy(accounts, (x) => x.session.type)).forEach(([sessionType]) => {
            const state = getProfileState(resolveSocialSourceFromSessionType(sessionType as SessionType));
            state.removeCurrentAccount();
            state.updateAccounts([]);
        });
    }

    // add accounts to the store
    await Promise.all(accounts.map((account) => getContext(account).state.addAccount(account, false)));

    // set the first account as the current account if no current account is set
    SORTED_SOCIAL_SOURCES.map((x) => {
        const { currentProfile, updateCurrentAccount, accounts } = getProfileState(x);
        const account = first(accounts);
        if (!currentProfile && account) updateCurrentAccount(account);
    });
}

/**
 * Restore firefly session from social account sessions
 * @param session
 * @param signal
 */
async function restoreFireflySession({ session, fireflySession }: Account, signal?: AbortSignal): Promise<void> {
    // polling failed
    if (!session.profileId)
        throw new Error(
            'Failed to query the signed key request status after several attempts. Please try again later.',
        );

    const account = {
        profile: createDummyProfile(Source.Farcaster),
        session: fireflySession ?? (await FireflySession.from(session, signal)),
    } satisfies Account;

    // update firefly state
    const state = getProfileState(Source.Firefly);
    state.updateAccounts([account]);
    state.updateCurrentAccount(account);

    // restore firefly session
    fireflySessionHolder.resumeSession(account.session);
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

    const { state, sessionHolder } = getContext(account);

    // check if the account belongs to the current firefly session
    const currentSession = getProfileState(Source.Firefly).currentProfileSession;
    const belongsTo =
        skipBelongsToCheck || !currentSession || !account.fireflySession
            ? true
            : isSameSession(currentSession, account.fireflySession);

    // add account to store cause it's from the same firefly session
    if (belongsTo) {
        state.addAccount(account, setAsCurrent);
        if (setAsCurrent) sessionHolder.resumeSession(account.session);
    }

    // restore accounts from firefly
    if (!skipRestoreFireflyAccounts && account.fireflySession) {
        const accountsSynced = await syncAccountsFromFirefly(account.fireflySession, signal);
        const accounts = belongsTo ? accountsSynced : uniqBy([account, ...accountsSynced], (x) => x.profile.profileId);

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
                                .map((account) => (
                                    <ProfileInList
                                        key={account.profile.profileId}
                                        selected
                                        selectable={false}
                                        profile={account.profile}
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
            }
        }
    }

    // restore firefly session
    if (account.session.type !== SessionType.Firefly && !skipRestoreFireflySession)
        await restoreFireflySession(account, signal);

    // account has been added to the store
    return true;
}

/**
 * Alias of addAccount
 * @param account
 * @param signal
 */
export async function switchAccount(account: Account, signal?: AbortSignal) {
    await addAccount(account, {
        setAsCurrent: true,
        skipBelongsToCheck: true,
        skipRestoreFireflyAccounts: true,
        skipRestoreFireflySession: true,
        signal,
    });
}

export async function removeAccount(account: Account, signal?: AbortSignal) {
    const { state, sessionHolder } = getContext(account);

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
