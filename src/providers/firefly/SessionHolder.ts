import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { NextFetchersOptions } from '@/helpers/getNextFetchers.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import type { FireflySession } from '@/providers/firefly/Session.js';
import { SupportedMethod } from '@/types/bridge.js';

class FireflySessionHolder extends SessionHolder<FireflySession> {
    fetchWithSessionGiven(session: FireflySession) {
        return <T>(url: string, init?: RequestInit) => {
            return fetchJSON<T>(url, {
                ...init,
                headers: { ...init?.headers, Authorization: `Bearer ${session.token}` },
            });
        };
    }

    override async fetchWithSession<T>(url: string, init?: RequestInit, options?: NextFetchersOptions) {
        const authToken = fireflyBridgeProvider.supported
            ? await fireflyBridgeProvider.request(SupportedMethod.GET_AUTHORIZATION, {})
            : this.sessionRequired.token;

        return fetchJSON<T>(
            url,
            {
                ...init,
                headers: { ...init?.headers, Authorization: `Bearer ${authToken}` },
            },
            options,
        );
    }

    override fetchWithoutSession<T>(url: string, init?: RequestInit, options?: NextFetchersOptions) {
        return fetchJSON<T>(url, init, options);
    }
}

export const fireflySessionHolder = new FireflySessionHolder();
