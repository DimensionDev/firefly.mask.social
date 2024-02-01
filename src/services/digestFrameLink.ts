import { parseHTML } from 'linkedom';

import * as frameMetadata from '@/helpers/getFrameMetadata.js';
import * as ogMetadata from '@/helpers/getOpenGraphMetadata.js';
import { parseURL } from '@/helpers/parseURL.js';
import { digestImageUrl } from '@/services/digestOpenGraphLink.js';
import type { Frame } from '@/types/frame.js';

export interface LinkDigest {
    frame: Frame;
}

export async function digestFrameLink(link: string, signal?: AbortSignal): Promise<Frame | null> {
    const url = parseURL(link);
    if (!url) return null;

    const response = await fetch(url, {
        headers: { 'User-Agent': 'Twitterbot' },
        signal,
    });
    if (!response.ok || (response.status >= 500 && response.status < 600)) return null;

    const html = await response.text();
    const { document } = parseHTML(html);

    const version = frameMetadata.getVersion(document);
    if (!version) return null;

    const imageUrl = frameMetadata.getImageUrl(document) ?? ogMetadata.getImageUrl(document);
    const image = imageUrl ? await digestImageUrl(imageUrl, signal) : null;
    if (!image) return null;

    const frame: Frame = {
        title: document.title,
        version: 'vNext',
        image: {
            url: image.url,
            width: image.width,
            height: image.height,
        },
    };

    return frame;
}
