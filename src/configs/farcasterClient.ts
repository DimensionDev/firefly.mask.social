import { t } from '@lingui/macro';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';

/**
 * This client serves as the global client for all requests to Farcaster.
 * When a session recover from the storage, it should be stored in this client.
 * All Farcaster providers should read sessions from this client.
 */
class FarcasterClient {
    private session: FarcasterSession | null = null;

    getSession() {
        return this.session;
    }

    getSessionRequired() {
        if (!this.session) throw new Error(t`No session found.`);
        return this.session;
    }

    resumeSession(session: FarcasterSession) {
        if (session.expiresAt > Date.now()) {
            this.session = session;
        }
    }

    fetch<T>(url: string, options?: RequestInit) {
        return this.session ? this.fetchWithSession<T>(url, options) : fetchJSON<T>(url, options);
    }
    
    fetchWithSession<T>(url: string, options?: RequestInit) {
        if (!this.session) throw new Error('No session found');
        return fetchJSON<T>(url, {
            ...options,
            headers: { ...options?.headers, Authorization: `Bearer ${this.session.token}` },
        });
    }
}

export const farcasterClient = new FarcasterClient();
