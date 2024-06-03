import urlcat from 'urlcat';

import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';

/**
 * Reports a scam NFT collection based on the provided collectionId.
 *
 * @param {string} collectionId - The unique identifier of the NFT collection to be reported.
 */
export async function reportNFT(collectionId: string) {
    const url = urlcat(FIREFLY_ROOT_URL, '/v1/misc/reportNFT');
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
