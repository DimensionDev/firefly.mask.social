import urlcat from 'urlcat';

import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';

export async function muteNFT(collectionId: string) {
    const url = urlcat(FIREFLY_ROOT_URL, '/v2/mute/collection');
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
