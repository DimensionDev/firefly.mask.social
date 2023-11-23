import { METADATA_WORKER_URL } from '@/constants/index.js';

/**
 * Uploads the given data to Arweave.
 *
 * @param data The data to upload.
 * @returns The Arweave transaction ID.
 * @throws An error if the upload fails.
 */
const uploadToArweave = async (data: any): Promise<string> => {
    try {
        const res = await fetch(METADATA_WORKER_URL, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        const upload = await res.json();
        const { id }: { id: string } = upload?.data;

        return id;
    } catch {
        throw new Error('Something went wrong!');
    }
};

export default uploadToArweave;
