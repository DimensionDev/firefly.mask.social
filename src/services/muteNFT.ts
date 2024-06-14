import urlcat from 'urlcat';

import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { settings } from '@/settings/index.js';

export async function muteNFT(collectionId: string) {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/mute/collection');
    await fireflySessionHolder.fetch(
        url,
        {
            method: 'POST',
            body: JSON.stringify({
                collection_id: collectionId,
            }),
        },
        true,
    );
}
