import { isSameProfile } from '@/helpers/isSameProfile.js';
import { isSameSession } from '@/helpers/isSameSession.js';
import type { Account } from '@/providers/types/Account.js';

export function isSameAccount(account: Account | null, otherAccount: Account | null, strict = false) {
    if (!account || !otherAccount) return false;
    return (
        isSameProfile(account.profile, otherAccount.profile) &&
        isSameSession(account.session, otherAccount.session, strict)
    );
}
