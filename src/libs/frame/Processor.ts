import { parseHTML } from 'linkedom';

import { anySignal } from '@/helpers/anySignal.js';
import { parseURL } from '@/helpers/parseURL.js';
import {
    getAspectRatio,
    getButtons,
    getImageUrl,
    getInput,
    getPostUrl,
    getRefreshPeriod,
    getState,
    getTitle,
    getVersion,
} from '@/libs/frame/readers/metadata.js';
import { OpenGraphProcessor } from '@/libs/og/Processor.js';
import type { Frame, LinkDigested } from '@/types/frame.js';

class Processor {
    digestDocument = async (url: string, html: string, signal?: AbortSignal): Promise<LinkDigested | null> => {
        const { document } = parseHTML(html);

        const version = getVersion(document);
        if (!version) return null;

        const imageUrl = getImageUrl(document);
        const image = imageUrl ? await OpenGraphProcessor.digestImageUrl(imageUrl, signal) : null;
        if (!image) return null;

        const frame: Frame = {
            url,
            title: getTitle(document) ?? 'Untitled Frame',
            version: 'vNext',
            image: {
                url: image.url,
                width: image.width,
                height: image.height,
            },
            postUrl: url,
            input: null,
            buttons: [],
            // never refresh by default
            refreshPeriod: Number.MAX_SAFE_INTEGER,
        };

        const postUrl = getPostUrl(document);
        const input = getInput(document);
        const buttons = getButtons(document);
        const refreshPeriod = getRefreshPeriod(document);
        const aspectRatio = getAspectRatio(document);
        const state = getState(document);

        if (postUrl) frame.postUrl = postUrl;
        if (input) frame.input = input;
        if (buttons.length) frame.buttons = buttons;
        if (refreshPeriod) frame.refreshPeriod = refreshPeriod;
        if (aspectRatio) frame.aspectRatio = aspectRatio;
        if (state) frame.state = state;

        return {
            frame,
        };
    };

    digestDocumentUrl = async (documentUrl: string, signal?: AbortSignal): Promise<LinkDigested | null> => {
        const url = parseURL(documentUrl);
        if (!url) return null;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Twitterbot' },
            // It must respond within 5 seconds.
            signal: anySignal(signal ?? null, AbortSignal.timeout(5000)),
        });
        if (!response.ok || (response.status >= 500 && response.status < 600)) return null;

        return this.digestDocument(documentUrl, await response.text(), signal);
    };
}

export const FrameProcessor = new Processor();
