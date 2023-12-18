import { HEY_API_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { GetPostMetaData } from '@/helpers/getPostMetaData.js';

interface IUploadToArweaveResponse {
    id: string;
    success: boolean;
}

/**
 * Uploads the given data to Arweave.
 *
 * @param data The data to upload.
 * @returns The Arweave transaction ID.
 * @throws An error if the upload fails.
 */
export async function uploadToArweave(data: GetPostMetaData): Promise<string> {
    try {
        const { id, success } = await fetchJSON<IUploadToArweaveResponse>(`${HEY_API_URL}/metadata`, {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!success) {
            throw new Error('Upload failed!');
        }

        return id;
    } catch {
        throw new Error('Something went wrong!');
    }
}
