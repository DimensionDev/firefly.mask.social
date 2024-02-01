import sizeOf from 'image-size';
import { parseHTML } from 'linkedom';
import urlcat from 'urlcat';

import {
    LENS_DETAIL_REGEX,
    MASK_SOCIAL_DETAIL_REGEX,
    MIRROR_HOSTNAME_REGEXP,
    WARPCAST_CONVERSATIONS_REGEX,
    WARPCAST_THREAD_REGEX,
} from '@/constants/regex.js';
import {
    generateIframe,
    getDescription,
    getEmbedUrl,
    getImageUrl,
    getIsLarge,
    getSite,
    getTitle,
} from '@/helpers/getOpenGraphMetadata.js';
import { getFarcasterPayload, getMirrorPayload } from '@/helpers/getOpenGraphPayload.js';
import { parseURL } from '@/helpers/parseURL.js';
import type { SourceInURL } from '@/helpers/resolveSource.js';
import { type FarcasterPayload, type MirrorPayload, OpenGraphPayloadSourceType, type PostPayload } from '@/types/og.js';

export interface OpenGraphImage {
    url: string;
    base64?: string;
    width?: number;
    height?: number;
}

export interface OpenGraph {
    type: 'website';
    url: string;
    favicon: string;
    title: string | null;
    description: string | null;
    site: string | null;
    image: OpenGraphImage | null;
    isLarge: boolean;
    html: string | null;
    locale: string | null;
}

export interface LinkDigest {
    og: OpenGraph;
    payload?: MirrorPayload | FarcasterPayload | PostPayload | null;
}

export async function digestImageUrl(url: string, signal?: AbortSignal): Promise<OpenGraphImage | null> {
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
}

export async function digestOpenGraphLink(link: string, signal?: AbortSignal): Promise<LinkDigest | null> {
    const url = parseURL(link);
    if (!url) return null;

    const response = await fetch(url, {
        headers: { 'User-Agent': 'Twitterbot' },
        signal,
    });
    if (!response.ok || (response.status >= 500 && response.status < 600)) return null;

    const html = await response.text();

    const { document } = parseHTML(html);

    const imageUrl = getImageUrl(document);
    const image = imageUrl && URL.canParse(imageUrl) ? await digestImageUrl(imageUrl, signal) : null;

    const og: OpenGraph = {
        type: 'website',
        url: link,
        favicon: urlcat('https://www.google.com/s2/favicons', { domain: link, sz: 128 }),
        title: getTitle(document),
        description: getDescription(document),
        site: getSite(document),
        image,
        isLarge: getIsLarge(document),
        html: generateIframe(getEmbedUrl(document), url.href),
        locale: null,
    };

    if (MIRROR_HOSTNAME_REGEXP.test(url.hostname)) {
        return {
            og,
            payload: getMirrorPayload(document),
        };
    }
    if (WARPCAST_THREAD_REGEX.test(link) || WARPCAST_CONVERSATIONS_REGEX.test(link)) {
        return {
            og,
            payload: getFarcasterPayload(document),
        };
    }
    if (LENS_DETAIL_REGEX.test(link)) {
        const id = link.match(/\/posts\/([^/]+)/)?.[1];
        if (!id) return { og };
        return {
            og,
            payload: {
                type: OpenGraphPayloadSourceType.Post,
                id,
                source: 'lens',
            },
        };
    }
    if (MASK_SOCIAL_DETAIL_REGEX.test(link)) {
        const match = link.match(MASK_SOCIAL_DETAIL_REGEX);
        const source = match ? match[1] : null;
        const id = match ? match[2] : null;

        if (!id || !source) return { og };
        return {
            og,
            payload: {
                type: OpenGraphPayloadSourceType.Post,
                id,
                source: source as SourceInURL,
            },
        };
    }

    return {
        og,
    };
}
