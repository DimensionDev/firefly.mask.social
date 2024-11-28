import { env } from '@/constants/env.js';
import { NOT_DEPEND_HUBBLE_KEY } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { NextFetchersOptions } from '@/helpers/getNextFetchers.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';

class FarcasterSessionHolder extends SessionHolder<FarcasterSession> {
    override resumeSession(session: FarcasterSession) {
        this.internalSession = session;
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

    async fetchHubble<T>(url: string, init?: RequestInit, options?: NextFetchersOptions) {
        const headers = {
            'Content-Type': 'application/octet-stream',
            ...init?.headers,
            api_key: NOT_DEPEND_HUBBLE_KEY,
        };

        if (env.internal.HUBBLE_TOKEN) {
            headers.api_key = env.internal.HUBBLE_TOKEN;
        } else if (env.external.NEXT_PUBLIC_HUBBLE_TOKEN) {
            headers.api_key = env.external.NEXT_PUBLIC_HUBBLE_TOKEN;
        } else {
            throw new Error('token not found.');
        }

        return await fetchJSON<T>(
            url,
            {
                ...init,
                headers: {
                    ...headers,
                    ...init?.headers,
                },
            },
            {
                noStrictOK: true,
                ...options,
            },
        );
    }
}

export const farcasterSessionHolder = new FarcasterSessionHolder();
