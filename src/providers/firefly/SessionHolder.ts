import { fetchJSON } from '@/helpers/fetchJSON.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import type { FireflySession } from '@/providers/firefly/Session.js';
import type { LensSession } from '@/providers/lens/Session.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';

class FireflySessionHolder extends SessionHolder<FireflySession> {
    withLensSession<K extends (host: LensSession | null, self: FireflySession | null) => unknown>(
        callback: K,
        required = false,
    ) {
        return callback(
            required ? lensSessionHolder.sessionRequired : lensSessionHolder.session,
            this.session,
        ) as ReturnType<K>;
    }

    withFarcasterSession<K extends (host: FarcasterSession | null, self: FireflySession | null) => unknown>(
        callback: K,
        required = false,
    ) {
        return callback(
            required ? farcasterSessionHolder.sessionRequired : farcasterSessionHolder.session,
            this.session,
        ) as ReturnType<K>;
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

export const fireflySessionHolder = new FireflySessionHolder();
