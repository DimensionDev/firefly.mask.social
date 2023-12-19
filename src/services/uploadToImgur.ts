import { t } from '@lingui/macro';
import { ImgurClient } from 'imgur';

interface UploadProgress {
    percent: number;
    transferred: number;
    total: number;
    id: string;
}

export async function uploadToImgur(
    file: File,
    metadata?: { title: string; description?: string },
    onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
    const client = new ImgurClient({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
    });
    client.on('uploadProgress', (progress) => onProgress?.(progress));

    const response = await client.upload({
        image: file.stream(),
        type: 'stream',
        title: metadata?.title ?? '',
        description: metadata?.description ?? '',
    });

    if (response.success) {
        return response.data.link;
    } else {
        throw new Error(t`Upload failed`);
    }
}
