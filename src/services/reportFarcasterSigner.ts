/* cspell:disable */

import urlcat from 'urlcat';

import { getPublicKeyInHexFromSession } from '@/helpers/ed25519.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { settings } from '@/settings/index.js';

export async function reportFarcasterSigner(session: FarcasterSession, signal?: AbortSignal) {
    // ensure session is available
    fireflySessionHolder.assertSession('[reportFarcasterSigner] firefly session required');

    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/farcaster_account/upSignerConfig');

    await fireflySessionHolder.fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            fid: session.profileId,
            signerPublickey: await getPublicKeyInHexFromSession(session),
            signerPrivatekey: session.token,
        }),
        signal,
    });
}
