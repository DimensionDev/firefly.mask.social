import sizeOf from 'image-size';
import { parseHTML } from 'linkedom';
import urlcat from 'urlcat';

import { SourceInURL } from '@/constants/enum.js';
import {
    LENS_DETAIL_REGEX,
    MASK_SOCIAL_DETAIL_REGEX,
    MASK_SOCIAL_POST_PATH_REGEX,
    MIRROR_HOSTNAME_REGEXP,
    WARPCAST_CONVERSATIONS_REGEX,
    WARPCAST_THREAD_REGEX,
} from '@/constants/regex.js';
import { parseURL } from '@/helpers/parseURL.js';
import {
    generateIframe,
    getDescription,
    getEmbedUrl,
    getImageUrl,
    getIsLarge,
    getSite,
    getTitle,
} from '@/libs/og/readers/metadata.js';
import { getFarcasterPayload, getMirrorPayload } from '@/libs/og/readers/payload.js';
import { type ImageDigested, type LinkDigested, type OpenGraph, PayloadType } from '@/types/og.js';

class Processor {
    digestImageUrl = async (url: string, signal?: AbortSignal): Promise<ImageDigested | null> => {
        // TODO: verify link
        const response = await fetch(url, {
            signal,
        });
        if (!response.ok) return null;

        const buffer = Buffer.from(await response.arrayBuffer());
        const img = sizeOf.imageSize(buffer);

        return {
            url,
            width: img.width ?? 0,
            height: img.height ?? 0,
            base64: `data:${response.headers.get('Content-Type')};base64,${buffer.toString('base64')}`,
        };
    };

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

        const imageUrl = getImageUrl(document);
        const image = imageUrl && URL.canParse(imageUrl) ? await this.digestImageUrl(imageUrl, signal) : null;

        const og = {
            type: 'website',
            url: documentUrl,
            favicon: urlcat('https://www.google.com/s2/favicons', { domain: documentUrl, sz: 128 }),
            title: getTitle(document),
            description: getDescription(document),
            site: getSite(document),
            image,
            isLarge: getIsLarge(document),
            html: generateIframe(getEmbedUrl(document), url.href),
            locale: null,
        } satisfies OpenGraph;

        if (MIRROR_HOSTNAME_REGEXP.test(url.hostname)) {
            return {
                og,
                payload: getMirrorPayload(document),
            };
        }
        if (WARPCAST_THREAD_REGEX.test(documentUrl) || WARPCAST_CONVERSATIONS_REGEX.test(documentUrl)) {
            return {
                og,
                payload: getFarcasterPayload(document),
            };
        }
        if (LENS_DETAIL_REGEX.test(documentUrl)) {
            const id = documentUrl.match(/\/posts\/([^/]+)/)?.[1];
            if (!id) return { og };
            return {
                og,
                payload: {
                    type: PayloadType.Post,
                    id,
                    source: SourceInURL.Lens,
                },
            };
        }
        if (MASK_SOCIAL_DETAIL_REGEX.test(documentUrl)) {
            const match = documentUrl.match(MASK_SOCIAL_POST_PATH_REGEX);
            const source = match ? match[1] : null;
            const id = match ? match[2] : null;

            if (!id || !source) return { og };
            return {
                og,
                payload: {
                    type: PayloadType.Post,
                    id,
                    source: source as SourceInURL,
                },
            };
        }

        return {
            og,
        };
    };
}

export const OpenGraphProcessor = new Processor();
