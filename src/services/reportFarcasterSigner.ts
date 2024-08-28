/* cspell:disable */

import urlcat from 'urlcat';

import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import { settings } from '@/settings/index.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';

export async function reportFarcasterSigner(session: FarcasterSession) {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/farcaster_account/upSignerConfig');
    await fireflySessionHolder.fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            fid: session.profileId,
            signerPublickey: '',
            signerPrivatekey: session.token,
        }),
    });
}
