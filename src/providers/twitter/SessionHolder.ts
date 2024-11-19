import { isServer } from '@tanstack/react-query';
import urlcat from 'urlcat';

import { SITE_URL } from '@/constants/index.js';
import { bom } from '@/helpers/bom.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import { TwitterNextAuthProvider } from '@/providers/twitter/NextAuth.js';
import { TwitterSession } from '@/providers/twitter/Session.js';

class TwitterSessionHolder extends SessionHolder<TwitterSession> {
    override resumeSession(session: TwitterSession) {
        this.internalSession = session;
    }

    override fetchWithSession<T>(url: string, options?: RequestInit) {
        const input = bom.window ? url : urlcat(SITE_URL, url);

        return fetchJSON<T>(
            input,
            {
                ...options,
                headers: TwitterSession.payloadToHeaders(this.sessionRequired.payload),
            },
            {
                noDefaultContentType: true,
            },
        );
    }

    override fetchWithoutSession<T>(url: string, options?: RequestInit) {
        const input = bom.window ? url : urlcat(SITE_URL, url);

        return fetchJSON<T>(input, options, {
            noDefaultContentType: true,
        });
    }

    override removeSession(): void {
        super.removeSession();
        if (!isServer) TwitterNextAuthProvider.logout();
    }
}

export const twitterSessionHolder = new TwitterSessionHolder();
