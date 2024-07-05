import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { Session } from '@/providers/types/Session.js';
import { bindFireflySession } from '@/services/bindFireflySession.js';
import { restoreFireflySession } from '@/services/restoreFireflySession.js';

export async function bindOrRestoreFireflySession(session: Session, signal?: AbortSignal) {
    try {
        if (fireflySessionHolder.session) {
            await bindFireflySession(session, signal);
            return fireflySessionHolder.assertSession();
        } else {
            throw new Error('Firefly session is not available');
        }
    } catch {
        // this will create a new session
        return restoreFireflySession(session, signal);
    }
}
