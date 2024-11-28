import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { NextFetchersOptions } from '@/helpers/getNextFetchers.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import type { FireflySession } from '@/providers/firefly/Session.js';

class FireflySessionHolder extends SessionHolder<FireflySession> {
    fetchWithSessionGiven(session: FireflySession) {
        return <T>(url: string, init?: RequestInit) => {
            return fetchJSON<T>(url, {
                ...init,
                headers: { ...init?.headers, Authorization: `Bearer ${session.token}` },
            });
        };
    }

    override fetchWithSession<T>(url: string, init?: RequestInit, options?: NextFetchersOptions) {
        return fetchJSON<T>(
            url,
            {
                ...init,
                headers: { ...init?.headers, Authorization: `Bearer ${this.sessionRequired.token}` },
            },
            options,
        );
    }

    override fetchWithoutSession<T>(url: string, init?: RequestInit, options?: NextFetchersOptions) {
        return fetchJSON<T>(url, init, options);
    }
}

export const fireflySessionHolder = new FireflySessionHolder();
