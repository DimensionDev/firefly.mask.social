import { getProfileStateBySessionType } from '@/helpers/getProfileState.js';
import { resolveSessionHolderFromSessionType } from '@/helpers/resolveSessionHolder.js';
import type { FireflySession } from '@/providers/firefly/Session.js';
import type { Account } from '@/providers/types/Account.js';

export function restoreAccount(account: Account) {
    const state = getProfileStateBySessionType(account.session.type);

    state.addAccount(account, true);
    resolveSessionHolderFromSessionType(account.session.type)?.resumeSession(account.session);
}

export function restoreSessionForFirefly(session: FireflySession | null) {
    if (!session) return;
    resolveSessionHolderFromSessionType(session.type)?.resumeSession(session);
}
