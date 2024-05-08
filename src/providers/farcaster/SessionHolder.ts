import { fetchJSON } from '@/helpers/fetchJSON.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';

class FarcasterSessionHolder extends SessionHolder<FarcasterSession> {
    override resumeSession(session: FarcasterSession) {
        this.internalSession = session;
    }

    override fetch<T>(url: string, options?: RequestInit, required = false) {
        return this.internalSession || required
            ? fetchJSON<T>(url, {
                  ...options,
                  headers: { ...options?.headers, Authorization: `Bearer ${this.sessionRequired.token}` },
              })
            : fetchJSON<T>(url, options);
    }
}

export const farcasterSessionHolder = new FarcasterSessionHolder();
