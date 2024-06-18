import { resolveSessionHolderFromSessionType } from '@/helpers/resolveSessionHolder.js';
import type { FireflySession } from '@/providers/firefly/Session.js';
import type { Account } from '@/providers/types/Account.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import {
    useFarcasterStateStore,
    useFireflyStateStore,
    useLensStateStore,
    useTwitterStateStore,
} from '@/store/useProfileStore.js';

export function restoreAccount(account: Account) {
    const store = {
        [SessionType.Farcaster]: useFarcasterStateStore,
        [SessionType.Lens]: useLensStateStore,
        [SessionType.Firefly]: useFireflyStateStore,
        [SessionType.Twitter]: useTwitterStateStore,
    }[account.session.type];

    store?.getState().updateAccounts([account]);
    store?.getState().updateCurrentAccount(account);
    resolveSessionHolderFromSessionType(account.session.type)?.resumeSession(account.session);
}

export function restoreSessionForFirefly(session: FireflySession | null) {
    if (!session) return;
    resolveSessionHolderFromSessionType(session.type)?.resumeSession(session);
}
