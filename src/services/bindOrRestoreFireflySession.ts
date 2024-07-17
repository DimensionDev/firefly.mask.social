import { NotAllowedError } from '@/constants/error.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { Session } from '@/providers/types/Session.js';
import { bindFireflySession } from '@/services/bindFireflySession.js';
import { restoreFireflySession } from '@/services/restoreFireflySession.js';

export async function bindOrRestoreFireflySession(session: Session, signal?: AbortSignal) {
    try {
        const farcasterSession = session as FarcasterSession;
        if (!FarcasterSession.isGrantByPermission(farcasterSession)) throw new NotAllowedError();

        if (fireflySessionHolder.session) {
            await bindFireflySession(session, signal);

            // this will return the existing session
            return fireflySessionHolder.assertSession();
        } else {
            throw new Error('Firefly session is not available');
        }
    } catch {
        // this will create a new session
        return restoreFireflySession(session, signal);
    }
}
