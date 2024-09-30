import { fetchJSON } from '@/helpers/fetchJSON.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import type { FireflySession } from '@/providers/firefly/Session.js';

class FireflySessionHolder extends SessionHolder<FireflySession> {
    fetchWithSessionGiven(session: FireflySession) {
        return <T>(url: string, options?: RequestInit) => {
            return fetchJSON<T>(url, {
                ...options,
                headers: { ...options?.headers, Authorization: `Bearer ${session.token}` },
            });
        };
    }

    override fetchWithSession<T>(url: string, options?: RequestInit) {
        return fetchJSON<T>(url, {
            ...options,
            headers: { ...options?.headers, Authorization: `Bearer ${this.sessionRequired.token}` },
        });
    }

    override fetchWithoutSession<T>(url: string, options?: RequestInit) {
        return fetchJSON<T>(url, options);
    }
}

export const fireflySessionHolder = new FireflySessionHolder();
