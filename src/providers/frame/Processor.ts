import { parseHTML } from 'linkedom';
import { z } from 'zod';

import { FetchError } from '@/constants/error.js';
import { anySignal } from '@/helpers/anySignal.js';
import { parseJSON } from '@/helpers/parseJSON.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import {
    getAspectRatio,
    getButtons,
    getImageAlt,
    getImageUrl,
    getInput,
    getPostUrl,
    getProtocol,
    getRefreshPeriod,
    getState,
    getTitle,
    getVersion,
} from '@/providers/frame/readers/metadata.js';
import { OpenGraphProcessor } from '@/providers/og/Processor.js';
import type { FrameV1, FrameV2, LinkDigestedResponse } from '@/types/frame.js';

const FrameV2Schema = z.object({
    version: z.string(),
    imageUrl: z.string().max(512, 'Max 512 characters'),
    button: z.object({
        title: z.string().max(32, 'Max length of 32 characters'),
        action: z.object({
            type: z.literal('launch_frame'),
            name: z.string().max(32, 'Max length of 32 characters'),
            url: z.string().max(512, 'Max 512 characters'),
            splashImageUrl: z.string().max(512, 'Max 512 characters'),
            splashBackgroundColor: z.string().regex(/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i, 'Hex color code'),
        }),
    }),
});

class Processor {
    digestDocumentV1 = async (url: string, document: Document, signal?: AbortSignal): Promise<FrameV1 | null> => {
        const imageUrl = getImageUrl(document);
        const imageAlt = getImageAlt(document);
        const digestedImage = imageUrl ? await OpenGraphProcessor.digestImageUrl(imageUrl, signal) : null;
        if (!digestedImage) console.error(`[frame] image not found: imageUrl = ${imageUrl}`);

        const image = digestedImage ?? {
            url: '/image/frame-fallback.png',
            width: 860,
            height: 640,
        };

        const frame: FrameV1 = {
            x_version: 1,
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
            protocol: getProtocol(document, true),
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

        return frame;
    };

    digestDocumentV2 = async (url: string, version: string, signal?: AbortSignal): Promise<FrameV2 | null> => {
        const payload = parseJSON<FrameV2>(version);
        const parsed = FrameV2Schema.safeParse(payload);
        if (!parsed.success) throw new Error(parsed.error.message);

        const frame: FrameV2 = {
            x_url: url,
            x_version: 2,
            ...parsed.data,
        };
        return frame;
    };

    digestDocument = async (url: string, html: string, signal?: AbortSignal): Promise<LinkDigestedResponse | null> => {
        const { document } = parseHTML(html);

        const version = getVersion(document);
        if (!version) throw new Error(`Version not found: ${url}`);

        // v2
        if (version.includes('version')) {
            return {
                frame: await this.digestDocumentV2(url, version, signal),
            };
        }

        // v1
        if (version === 'vNext') {
            return {
                frame: await this.digestDocumentV1(url, document, signal),
            };
        }

        return null;
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
