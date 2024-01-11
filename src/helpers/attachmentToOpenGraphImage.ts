import { imageSize } from 'image-size';

import type { Attachment } from '@/providers/types/SocialMedia.js';

interface OpenGraphImage {
    url: string;
    width: number;
    height: number;
}

export async function attachmentToOpenGraphImage(attachment: Attachment): Promise<OpenGraphImage | undefined> {
    const url = attachment.type === 'Image' ? attachment.uri : attachment.coverUri;
    if (!url) return;

    return new Promise((resolve, reject) => {
        imageSize(url, (err, dimensions) => {
            if (err) {
                reject(err);
                return;
            }

            if (!dimensions?.width || !dimensions.height) {
                reject('Failed to read dimensions.');
                return;
            }

            resolve({
                url,
                width: dimensions.width,
                height: dimensions.height,
            });
        });
    });
}
