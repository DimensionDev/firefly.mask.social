import { env } from '@/constants/env.js';
import { NOT_DEPEND_HUBBLE_KEY } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { SupportedMethod } from '@/types/bridge.js';

class FarcasterSessionHolder extends SessionHolder<FarcasterSession> {
    override resumeSession(session: FarcasterSession) {
        this.internalSession = session;
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

    async fetchHubble<T>(url: string, options?: RequestInit) {
        const headers = {
            'Content-Type': 'application/octet-stream',
            ...options?.headers,
            api_key: NOT_DEPEND_HUBBLE_KEY,
        };

        if (env.internal.HUBBLE_TOKEN) {
            headers.api_key = env.internal.HUBBLE_TOKEN;
        } else if (env.external.NEXT_PUBLIC_HUBBLE_TOKEN) {
            headers.api_key = env.external.NEXT_PUBLIC_HUBBLE_TOKEN;
        } else {
            throw new Error('token not found.');
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options?.headers,
            },
        });

        const json = await response.json();
        return json as T;
    }
}

export const farcasterSessionHolder = new FarcasterSessionHolder();
