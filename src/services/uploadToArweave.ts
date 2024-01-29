import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { GetPostMetaData } from '@/services/postForLens.js';
import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import urlcat from 'urlcat';

interface IUploadToArweaveResponse {
    data: string 
}

/**
 * Uploads the given data to Arweave.
 *
 * @param data The data to upload.
 * @returns The Arweave transaction ID.
 * @throws An error if the upload fails.
 */
export async function uploadToArweave(data: GetPostMetaData, token: string): Promise<string> {
    try {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/lens/public_metadata')
        const {
            data: id,
        } = await fetchJSON<IUploadToArweaveResponse>(url, {
            method: 'POST',
            headers:{
                'x-access-token': token
            },
            body: JSON.stringify(data),
        });

        if (!id) {
            throw new Error('Upload failed!');
        }

        return id;
    } catch {
        throw new Error('Something went wrong!');
    }
}
