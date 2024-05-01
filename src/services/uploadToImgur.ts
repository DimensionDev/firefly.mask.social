import { fetchJSON } from '@/helpers/fetchJSON.js';

interface UploadImgurResponse {
    data: {
        link: string;
    };
}

import { env } from '@/constants/env.js';

export async function uploadToImgur(file: File, metadata?: { title: string; description?: string }): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', metadata?.title ?? file.name);
    if (metadata?.description) formData.append('description', metadata.description);

    const { data } = await fetchJSON<UploadImgurResponse>('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
            Authorization: `Client-ID ${env.internal.IMGUR_CLIENT_ID}`,
        },
        body: formData,
    });
    return data.link;
}
