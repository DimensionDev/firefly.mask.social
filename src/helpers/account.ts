import { type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import { getProfileState } from '@/helpers/getProfileState.js';
import { isSameAccount } from '@/helpers/isSameAccount.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { resolveSessionHolder, resolveSessionHolderFromSessionType } from '@/helpers/resolveSessionHolder.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { Account } from '@/providers/types/Account.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import { useFireflyStateStore } from '@/store/useProfileStore.js';

function getContext(account: Account) {
    return {
        state: getProfileState(account.profile.source),
        sessionHolder: resolveSessionHolderFromSessionType(account.session.type),
    };
}

async function restoreFireflySession(session: Session, signal?: AbortSignal): Promise<void> {
    // polling failed
    if (!session.profileId)
        throw new Error(
            'Failed to query the signed key request status after several attempts. Please try again later.',
        );

    const account = {
        profile: createDummyProfile(Source.Farcaster),
        session: await FireflySession.from(session, signal),
    };

    // update firefly state
    const state = useFireflyStateStore.getState();
    state.updateAccounts([account]);
    state.updateCurrentAccount(account);

    // restore firefly session
    fireflySessionHolder.resumeSession(account.session);
}

export async function addAccount(
    account: Account,
    {
        // set the account as the current account
        setAsCurrent = true,
        restoreSession = true,
        signal,
    }: {
        setAsCurrent?: boolean;
        restoreSession?: boolean;
        signal?: AbortSignal;
    } = {},
) {
    const { state, sessionHolder } = getContext(account);

    state.addAccount(account, setAsCurrent);
    if (setAsCurrent) sessionHolder.resumeSession(account.session);

    if (account.session.type !== SessionType.Firefly && restoreSession) {
        await restoreFireflySession(account.session, signal);
    }
}

/**
 * Alias of addAccount
 * @param account
 * @param signal
 */
export async function switchAccount(account: Account, signal?: AbortSignal) {
    await addAccount(account, {
        setAsCurrent: true,
        restoreSession: false,
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
    if (account) await removeAccount(account);
}

export async function removeAllAccounts() {
    SORTED_SOCIAL_SOURCES.forEach((x) => {
        getProfileState(x).clear();
        resolveSessionHolder(x)?.removeSession();
    });

    useFireflyStateStore.getState().clear();
    fireflySessionHolder.removeSession();
}
