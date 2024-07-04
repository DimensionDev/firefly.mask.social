import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { Session } from '@/providers/types/Session.js';
import { bindFireflySession } from '@/services/bindFireflySession.js';
import { restoreFireflySession } from '@/services/restoreFireflySession.js';

export async function bindOrRestoreFireflySession(session: Session, signal?: AbortSignal) {
    if (fireflySessionHolder.session) {
        await bindFireflySession(session, signal);
        return fireflySessionHolder.assertSession();
    }
    return restoreFireflySession(session, signal);
}
