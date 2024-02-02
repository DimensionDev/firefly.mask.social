import { parseHTML } from 'linkedom';

import { parseURL } from '@/helpers/parseURL.js';
import { getImageUrl, getVersion } from '@/libs/frame/readers/metadata.js';
import { OpenGraphProcessor } from '@/libs/og/Processor.js';
import type { Frame, LinkDigested } from '@/types/frame.js';

class Processor {
    digestDocumentUrl = async (documentUrl: string, signal?: AbortSignal): Promise<LinkDigested | null> => {
        const url = parseURL(documentUrl);
        if (!url) return null;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Twitterbot' },
            signal,
        });
        if (!response.ok || (response.status >= 500 && response.status < 600)) return null;

        const html = await response.text();
        const { document } = parseHTML(html);

        const version = getVersion(document);
        if (!version) return null;

        const imageUrl = getImageUrl(document);
        const image = imageUrl ? await OpenGraphProcessor.digestImageUrl(imageUrl, signal) : null;
        if (!image) return null;

        const frame = {
            title: document.title,
            version: 'vNext',
            image: {
                url: image.url,
                width: image.width,
                height: image.height,
            },
        } satisfies Frame;

        return {
            frame,
        };
    };
}

export const FrameProcessor = new Processor();
