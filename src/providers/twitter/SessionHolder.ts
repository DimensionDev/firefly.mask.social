import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import { TwitterSession } from '@/providers/twitter/Session.js';

class TwitterSessionHolder extends SessionHolder<TwitterSession> {
    override resumeSession(session: TwitterSession) {
        this.internalSession = session;
    }

    override fetch<T>(url: string, options?: RequestInit, required = false) {
        if (required && !this.internalSession?.payload) throw new Error('Twitter session is required');
        const input = typeof window === 'undefined' ? urlcat(SITE_URL, url) : url;

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

export const twitterSessionHolder = new TwitterSessionHolder(Source.Twitter);
