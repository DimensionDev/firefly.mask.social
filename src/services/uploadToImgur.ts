import { t } from '@lingui/macro';

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
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', metadata?.title ?? file.name);
    if (metadata?.description) formData.append('description', metadata.description);

    const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
            Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
        },
        body: formData,
    });
    if (!response.ok) {
        throw new Error(t`Failed to upload to Imgur`);
    }
    const json = await response.json();

    return json.data.link;
}
