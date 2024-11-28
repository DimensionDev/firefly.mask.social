import { isServer } from '@tanstack/react-query';
import urlcat from 'urlcat';

import { SITE_URL } from '@/constants/index.js';
import { bom } from '@/helpers/bom.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import { TwitterAuthProvider } from '@/providers/twitter/Auth.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import type { NextFetchersOptions } from '@/helpers/getNextFetchers.js';

class TwitterSessionHolder extends SessionHolder<TwitterSession> {
    override resumeSession(session: TwitterSession) {
        this.internalSession = session;
    }

    override fetchWithSession<T>(url: string, init?: RequestInit, options?: NextFetchersOptions) {
        const input = bom.window ? url : urlcat(SITE_URL, url);

        return fetchJSON<T>(
            input,
            {
                ...init,
                headers: TwitterSession.payloadToHeaders(this.sessionRequired.payload),
            },
            {
                noDefaultContentType: true,
                ...options,
            },
        );
    }

    override fetchWithoutSession<T>(url: string, init?: RequestInit, options?: NextFetchersOptions) {
        const input = bom.window ? url : urlcat(SITE_URL, url);

        return fetchJSON<T>(input, init, {
            noDefaultContentType: true,
            ...options,
        });
    }

    override removeSession(): void {
        super.removeSession();
        if (!isServer) TwitterAuthProvider.logout();
    }
}

export const twitterSessionHolder = new TwitterSessionHolder();
