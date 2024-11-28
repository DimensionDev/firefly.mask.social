import { fetchJSON } from '@/helpers/fetchJSON.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import type { FireflySession } from '@/providers/firefly/Session.js';
import { SupportedMethod } from '@/types/bridge.js';

class FireflySessionHolder extends SessionHolder<FireflySession> {
    fetchWithSessionGiven(session: FireflySession) {
        return <T>(url: string, options?: RequestInit) => {
            return fetchJSON<T>(url, {
                ...options,
                headers: { ...options?.headers, Authorization: `Bearer ${session.token}` },
            });
        };
    }

    override async fetchWithSession<T>(url: string, options?: RequestInit) {
        const authToken = fireflyBridgeProvider.supported
            ? await fireflyBridgeProvider.request(SupportedMethod.GET_AUTHORIZATION, {})
            : this.sessionRequired.token;
        return fetchJSON<T>(url, {
            ...options,
            headers: { ...options?.headers, Authorization: `Bearer ${authToken}` },
        });
    }

    override fetchWithoutSession<T>(url: string, options?: RequestInit) {
        return fetchJSON<T>(url, options);
    }
}

export const fireflySessionHolder = new FireflySessionHolder();
