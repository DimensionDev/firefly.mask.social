import { Source } from '@/constants/enum.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import type { FireflySession } from '@/providers/firefly/Session.js';

class FireflySessionHolder extends SessionHolder<FireflySession> {
    override fetch<T>(url: string, options?: RequestInit, required = false) {
        return this.internalSession || required
            ? fetchJSON<T>(url, {
                  ...options,
                  headers: { ...options?.headers, Authorization: `Bearer ${this.sessionRequired.token}` },
              })
            : fetchJSON<T>(url, options);
    }

    fetchWithSession(session: FireflySession) {
        return <T>(url: string, options?: RequestInit) => {
            return fetchJSON<T>(url, {
                ...options,
                headers: { ...options?.headers, Authorization: `Bearer ${session.token}` },
            });
        };
    }
}

export const fireflySessionHolder = new FireflySessionHolder();
