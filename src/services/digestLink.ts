import sizeOf from 'image-size';
import { parseHTML } from 'linkedom';
import urlcat from 'urlcat';

import { MIRROR_HOSTNAME_REGEXP, WARPCAST_CONVERSATIONS_REGEX, WARPCAST_THREAD_REGEX } from '@/constants/regex.js';
import {
    generateIframe,
    getDescription,
    getEmbedUrl,
    getImageUrl,
    getIsLarge,
    getSite,
    getTitle,
} from '@/helpers/getMetadata.js';
import { getFarcasterPayload, getMirrorPayload } from '@/helpers/getPayload.js';
import type { FarcasterPayload, MirrorPayload } from '@/types/og.js';

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
    payload?: MirrorPayload | FarcasterPayload | null;
}

export async function digestImageUrl(url: string): Promise<OpenGraphImage | null> {
    // TODO: verify link
    const response = await fetch(url);
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

export async function digestLink(link: string): Promise<LinkDigest> {
    const { html } = await fetch(link, {
        headers: { 'User-Agent': 'Twitterbot' },
    }).then(async (res) => ({
        html: await res.text(),
    }));

    const { document } = parseHTML(html);

    const imageUrl = getImageUrl(document);
    const image = imageUrl ? await digestImageUrl(imageUrl) : null;

    const og: OpenGraph = {
        type: 'website',
        url: link,
        favicon: urlcat('https://www.google.com/s2/favicons', { domain: link, sz: 128 }),
        title: getTitle(document),
        description: getDescription(document),
        site: getSite(document),
        image,
        isLarge: getIsLarge(document),
        html: generateIframe(getEmbedUrl(document), link),
        locale: null,
    };

    const u = URL.canParse(link) ? new URL(link) : null;

    if (u && MIRROR_HOSTNAME_REGEXP.test(u.hostname)) {
        return {
            og,
            payload: getMirrorPayload(document),
        };
    } else if (WARPCAST_THREAD_REGEX.test(link) || WARPCAST_CONVERSATIONS_REGEX.test(link)) {
        return {
            og,
            payload: getFarcasterPayload(document),
        };
    }

    return {
        og,
    };
}
