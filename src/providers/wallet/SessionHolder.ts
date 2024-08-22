import urlcat from 'urlcat';

import { SITE_URL } from '@/constants/index.js';
import { bom } from '@/helpers/bom.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import { TwitterSession } from '@/providers/twitter/Session.js';

class WalletSessionHolder extends SessionHolder<TwitterSession> {
    override resumeSession(session: TwitterSession) {
        this.internalSession = session;
    }

    override fetch<T>(url: string, options?: RequestInit, required = false) {
        if (required && !this.internalSession?.payload) throw new Error('Twitter session is required');

        const input = bom.window ? url : urlcat(SITE_URL, url);

        return this.internalSession?.payload
            ? fetchJSON<T>(
                  input,
                  {
                      ...options,
                      headers: TwitterSession.payloadToHeaders(this.internalSession.payload),
                  },
                  {
                      noDefaultContentType: true,
                  },
              )
            : fetchJSON<T>(input, options, {
                  noDefaultContentType: true,
              });
    }
}

export const walletSessionHolder = new WalletSessionHolder();
