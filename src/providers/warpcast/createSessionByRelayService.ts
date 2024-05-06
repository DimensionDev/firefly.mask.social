import urlcat from 'urlcat';

import { FARCASTER_REPLY_URL, SITE_HOSTNAME, SITE_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { parseURL } from '@/helpers/parseURL.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';

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

    const farcasterSession = new FarcasterSession(
        // not available
        '',
        // not available
        '',
        Date.now(),
        Date.now(),
        '',
        response.channelToken,
    );

    return {
        deeplink: response.connectUri,
        session: farcasterSession,
    };
}

export async function createSessionByRelayService(callback?: (url: string) => void, signal?: AbortSignal) {
    const { deeplink, session } = await createSession(signal);

    // present QR code to the user or open the link in a new tab
    callback?.(deeplink);

    try {
        // firefly start polling for the signed key request
        // once key request is signed, we will get the fid
        const fireflySession = await FireflySession.from(session, signal);

        if (fireflySession) {
            // we also posses the session in firefly session holder
            // which means if we login in farcaster, we login firefly as well
            fireflySessionHolder.resumeSession(fireflySession);
        }
    } catch (error) {
        console.error(`[createSessionByRelayService] failed to restore firefly session: ${error}`);
    }

    // polling failed
    if (!session.profileId)
        throw new Error(
            'Failed to query the signed key request status after several attempts. Please try again later.',
        );

    return session;
}
