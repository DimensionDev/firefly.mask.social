import { t } from '@lingui/macro';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { WarpcastSession } from '@/providers/warpcast/Session.js';

class WarpcastClient {
    private session: WarpcastSession | null = null;

    getSession() {
        return this.session;
    }

    getSessionRequired() {
        if (!this.session) throw new Error(t`No session found.`);
        return this.session;
    }

    resumeSession(session: WarpcastSession) {
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

export const warpcastClient = new WarpcastClient();
