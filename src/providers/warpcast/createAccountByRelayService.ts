import urlcat from 'urlcat';

import { FARCASTER_REPLY_URL, SITE_HOSTNAME, SITE_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { parseURL } from '@/helpers/parseURL.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import type { Account } from '@/providers/types/Account.js';
import { bindOrRestoreFireflySession } from '@/services/bindOrRestoreFireflySession.js';

interface FarcasterReplyResponse {
    channelToken: string;
    url: string;
    // the same as url
    connectUri: string;
    // cspell: disable-next-line
    // example: dpO7VRkrPcwyLhyFZ
    nonce: string;
}

async function createSession(signal?: AbortSignal) {
    const url = urlcat(FARCASTER_REPLY_URL, '/v1/channel');
    const response = await fetchJSON<FarcasterReplyResponse>(url, {
        method: 'POST',
        body: JSON.stringify({
            siweUri: SITE_URL,
            domain: parseURL(SITE_URL)?.hostname ?? SITE_HOSTNAME,
        }),
        signal,
    });

    const now = Date.now();
    const farcasterSession = new FarcasterSession(
        // not available
        '',
        // not available
        '',
        now,
        now,
        '',
        response.channelToken,
    );

    return {
        deeplink: response.connectUri,
        session: farcasterSession,
    };
}

export async function createAccountByRelayService(callback?: (url: string) => void, signal?: AbortSignal) {
    const { deeplink, session } = await createSession(signal);

    // present QR code to the user or open the link in a new tab
    callback?.(deeplink);

    // polling for the session to be ready
    const fireflySession = await bindOrRestoreFireflySession(session, signal);

    // profile id is available after the session is ready
    const profile = await FarcasterSocialMediaProvider.getProfileById(session.profileId);

    return {
        session,
        profile,
        fireflySession,
    } satisfies Account;
}
