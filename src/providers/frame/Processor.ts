import { parseHTML } from 'linkedom';

import { FetchError } from '@/constants/error.js';
import { anySignal } from '@/helpers/anySignal.js';
import { getFrameClientProtocol } from '@/helpers/getFrameClientProtocol.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import {
    getAspectRatio,
    getButtons,
    getImageAlt,
    getImageUrl,
    getInput,
    getPostUrl,
    getRefreshPeriod,
    getState,
    getTitle,
    getVersion,
} from '@/providers/frame/readers/metadata.js';
import { OpenGraphProcessor } from '@/providers/og/Processor.js';
import type { Frame, LinkDigestedResponse } from '@/types/frame.js';

class Processor {
    digestDocument = async (url: string, html: string, signal?: AbortSignal): Promise<LinkDigestedResponse | null> => {
        const { document } = parseHTML(html);

        const version = getVersion(document);
        if (!version) throw new Error('Version not found');

        const imageUrl = getImageUrl(document);
        const imageAlt = getImageAlt(document);
        const digestedImage = imageUrl ? await OpenGraphProcessor.digestImageUrl(imageUrl, signal) : null;
        if (!digestedImage) console.error(`[frame] image not found: imageUrl = ${imageUrl}`);

        const image = digestedImage ?? {
            url: '/image/frame-fallback.png',
            width: 860,
            height: 640,
        };

        const frame: Frame = {
            url,
            title: getTitle(document) ?? 'Untitled Frame',
            version: 'vNext',
            image: {
                url: image.url,
                alt: imageAlt ? imageAlt : undefined,
                width: image.width,
                height: image.height,
            },
            postUrl: url,
            input: null,
            buttons: [],
            // never refresh by default
            refreshPeriod: Number.MAX_SAFE_INTEGER,
            protocol: getFrameClientProtocol(document),
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

    digestDocumentUrl = async (documentUrl: string, signal?: AbortSignal): Promise<LinkDigestedResponse | null> => {
        const url = parseUrl(documentUrl);
        if (!url) throw new Error(`[frame] invalid document URL: ${documentUrl}`);

        const response = await fetch(url, {
            // It must respond within 5 seconds.
            signal: anySignal(signal ?? null, AbortSignal.timeout(5000)),
        });
        if (!response.ok || (response.status >= 500 && response.status < 600)) {
            const fetchError = await FetchError.from(url, response);
            fetchError.toThrow();
        }
        if (!response.headers.get('content-type')?.startsWith('text/')) return null;

        return this.digestDocument(documentUrl, await response.text(), signal);
    };
}

export const FrameProcessor = new Processor();
