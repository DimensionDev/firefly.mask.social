import { parseHTML } from 'linkedom';

import { parseURL } from '@/helpers/parseURL.js';
import {
    getButtons,
    getImageUrl,
    getPostUrl,
    getRefreshPeriod,
    getTitle,
    getVersion,
} from '@/libs/frame/readers/metadata.js';
import { OpenGraphProcessor } from '@/libs/og/Processor.js';
import type { Frame, FrameButton, LinkDigested } from '@/types/frame.js';

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
            url: documentUrl,
            title: getTitle(document) ?? 'Untitled Frame',
            version: 'vNext',
            image: {
                url: image.url,
                width: image.width,
                height: image.height,
            },
            postUrl: documentUrl,
            buttons: [] as FrameButton[],
            // never refresh by default
            refreshPeriod: Number.MAX_SAFE_INTEGER,
        } satisfies Frame;

        const postUrl = getPostUrl(document);
        const buttons = getButtons(document);
        const refreshPeriod = getRefreshPeriod(document);

        if (postUrl) frame.postUrl = postUrl;
        if (buttons.length) frame.buttons = buttons;
        if (refreshPeriod) frame.refreshPeriod = refreshPeriod;

        return {
            frame,
        };
    };
}

export const FrameProcessor = new Processor();
