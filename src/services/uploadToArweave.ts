import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { GetPostMetaData } from '@/helpers/publishPostForLens.js';

interface IUploadToArweaveResponse {
    data: {
        id: string;
        success: boolean;
    };
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
        const {
            data: { id, success },
        } = await fetchJSON<IUploadToArweaveResponse>(`/api/metadata`, {
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
