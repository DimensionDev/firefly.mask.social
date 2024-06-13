import urlcat from 'urlcat';

import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { settings } from '@/settings/index.js';

/**
 * Reports a scam NFT collection based on the provided collectionId.
 *
 * @param {string} collectionId - collection id from Simplehash
 */
export async function reportNFT(collectionId: string) {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/misc/reportNFT');
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
