import { HEY_API_URL } from '@/constants/index.js';
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
const uploadToArweave = async (data: GetPostMetaData): Promise<string> => {
    try {
        const res = await fetch(`${HEY_API_URL}/metadata`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        const upload: IUploadToArweaveResponse = await res.json();
        const { id, success } = upload;

        if (!success) {
            throw new Error('Upload failed!');
        }

        return id;
    } catch {
        throw new Error('Something went wrong!');
    }
};

export default uploadToArweave;
