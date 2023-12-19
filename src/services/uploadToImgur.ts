import { t } from '@lingui/macro';
import { ImgurClient } from 'imgur';

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            if (reader.result) {
                resolve(reader.result as string);
            } else {
                reject(new Error('Failed to load file'));
            }
        };

        reader.onerror = function () {
            reject(new Error('Failed to load file'));
        };
    });
}

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

    const base64File = await fileToBase64(file);

    const response = await client.upload({
        image: base64File,
        type: 'base64',
        title: metadata?.title ?? '',
        description: metadata?.description ?? '',
    });

    if (response.success) {
        return response.data.link;
    } else {
        throw new Error(t`Upload failed`);
    }
}
