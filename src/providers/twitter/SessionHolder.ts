import { fetchJSON } from '@/helpers/fetchJSON.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import { TwitterSession } from '@/providers/twitter/Session.js';

class TwitterSessionHolder extends SessionHolder<TwitterSession> {
    override resumeSession(session: TwitterSession) {
        this.internalSession = session;
    }

    override fetch<T>(url: string, options?: RequestInit, required = false) {
        if (required && !this.internalSession?.payload) throw new Error('Twitter session is required');

        return this.internalSession?.payload
            ? fetchJSON<T>(
                  url,
                  {
                      ...options,
                      headers: TwitterSession.payloadToHeaders(this.internalSession.payload),
                  },
                  {
                      noDefaultContentType: true,
                  },
              )
            : fetchJSON<T>(url, options, {
                  noDefaultContentType: true,
              });
    }
}

export const twitterSessionHolder = new TwitterSessionHolder();
