export interface IPFSResponse {
    uri: string;
    mimeType: string;
}

const FALLBACK_TYPE = 'image/jpeg';

/**
 * Uploads a set of files to the IPFS network via S3 and returns an array of MediaSet objects.
 *
 * @param data Files to upload to IPFS.
 * @returns Array of MediaSet objects.
 */
export async function uploadFilesToIPFS(
    files: File[],
    onProgress?: (percentage: number) => void,
): Promise<IPFSResponse[]> {
    const attachments = await Promise.all(
        files.map(async (file) => {
            const form = new FormData();
            form.append('file', file);
            const res = await fetch('/api/file', {
                method: 'POST',
                body: form,
            });
            const json = await res.json();

            return {
                uri: json.data.uri as string,
                mimeType: file.type || FALLBACK_TYPE,
            };
        }),
    );

    return attachments;
}

/**
 * Uploads a file to the IPFS network via S3 and returns a MediaSet object.
 *
 * @param file File to upload to IPFS.
 * @returns MediaSet object or null if the upload fails.
 */
export async function uploadFileToIPFS(file: File, onProgress?: (percentage: number) => void): Promise<IPFSResponse> {
    const ipfsResponse = await uploadFilesToIPFS([file], onProgress);
    const metadata = ipfsResponse[0];

    return { uri: metadata.uri, mimeType: file.type || FALLBACK_TYPE };
}
