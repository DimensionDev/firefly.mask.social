import type { SocialSource } from '@/constants/enum.js';
import { getProfileState } from '@/helpers/getProfileState.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { resolveSessionHolder, resolveSessionHolderFromSessionType } from '@/helpers/resolveSessionHolder.js';
import type { Account } from '@/providers/types/Account.js';

export function addAccount(account: Account) {
    getProfileState(account.profile.source).addAccount(account);
    resolveSessionHolderFromSessionType(account.session.type)?.resumeSession(account.session);
}

export function switchAccount(account: Account) {
    getProfileState(account.profile.source).updateCurrentAccount(account);
    resolveSessionHolder(account.profile.source)?.resumeSession(account.session);
}

export function removeAccount(account: Account) {
    getProfileState(account.profile.source).removeAccount(account);
    resolveSessionHolderFromSessionType(account.session.type)?.removeSession();
}

export function removeCurrentAccount(source: SocialSource) {
    const { accounts, currentProfile } = getProfileState(source);
    const account = accounts.find((x) => isSameProfile(x.profile, currentProfile));
    if (account) removeAccount(account);
}
