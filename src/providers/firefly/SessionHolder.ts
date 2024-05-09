import { once } from 'lodash-es';

import { Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveSessionHolder } from '@/helpers/resolveSessionHolder.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import type { FireflySession } from '@/providers/firefly/Session.js';
import type { LensSession } from '@/providers/lens/Session.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import { restoreFireflySession } from '@/services/restoreFireflySession.js';

// the restoration will be executed when the first request is made
const restoreSession = once(async () => {
    for (const source of SORTED_SOCIAL_SOURCES) {
        // we don't support twitter for now
        if (source === Source.Twitter) continue;

        const holder = resolveSessionHolder(source);
        if (!holder?.session) continue;

        const fireflySession = await restoreFireflySession(holder.session);
        if (!fireflySession) continue;

        return fireflySession;
    }
    return null;
});

class FireflySessionHolder extends SessionHolder<FireflySession> {
    private async restoreSessionIfNeeded() {
        if (this.session) return;

        const session = await restoreSession();
        if (session) this.resumeSession(session);
    }

    async withLensSession<K extends (host: LensSession | null, self: FireflySession | null) => unknown>(
        callback: K,
        required = false,
    ) {
        await this.restoreSessionIfNeeded();

        return callback(
            required ? lensSessionHolder.sessionRequired : lensSessionHolder.session,
            this.session,
        ) as ReturnType<K>;
    }

    async withFarcasterSession<K extends (host: FarcasterSession | null, self: FireflySession | null) => unknown>(
        callback: K,
        required = false,
    ) {
        await this.restoreSessionIfNeeded();

        return callback(
            required ? farcasterSessionHolder.sessionRequired : farcasterSessionHolder.session,
            this.session,
        ) as ReturnType<K>;
    }

    override async fetch<T>(url: string, options?: RequestInit, required = false) {
        await this.restoreSessionIfNeeded();

        return this.internalSession || required
            ? fetchJSON<T>(url, {
                  ...options,
                  headers: { ...options?.headers, Authorization: `Bearer ${this.sessionRequired.token}` },
              })
            : fetchJSON<T>(url, options);
    }
}

export const fireflySessionHolder = new FireflySessionHolder();
