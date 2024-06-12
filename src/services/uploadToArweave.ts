import { t } from '@lingui/macro';
import urlcat from 'urlcat';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { GetPostMetaData } from '@/services/postToLens.js';
import { settings } from '@/settings/index.js';

interface IUploadToArweaveResponse {
    data: {
        arweaveTxId: string;
    };
}

/**
 * Uploads the given data to Arweave.
 *
 * @param data The data to upload.
 * @returns The Arweave transaction ID.
 * @throws An error if the upload fails.
 */
export async function uploadToArweave(data: GetPostMetaData, token: string): Promise<string> {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/lens/public_metadata');
    const {
        data: { arweaveTxId },
    } = await fetchJSON<IUploadToArweaveResponse>(url, {
        method: 'POST',
        headers: {
            'x-access-token': token,
        },
        body: JSON.stringify(data),
    });
    if (!arweaveTxId) throw new Error(t`Found arweaveTxId is empty.`);
    return arweaveTxId;
}
