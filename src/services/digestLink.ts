import sizeOf from 'image-size';
import { parseHTML } from 'linkedom';
import urlcat from 'urlcat';

import { MIRROR_REGEX } from '@/constants/regex.js';
import {
    generateIframe,
    getDescription,
    getEmbedUrl,
    getImage,
    getIsLarge,
    getSite,
    getTitle,
} from '@/helpers/getMetadata.js';
import { type MirrorPayload, OpenGraphPayloadSourceType } from '@/types/openGraph.js';

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
    payload?: MirrorPayload;
}

export async function digestLink(link: string): Promise<LinkDigest> {
    const { html } = await fetch(link, {
        headers: { 'User-Agent': 'Twitterbot' },
    }).then(async (res) => ({
        html: await res.text(),
    }));

    const { document } = parseHTML(html);

    const imageUrl = getImage(document);
    let image: OpenGraphImage | null = null;
    if (imageUrl) {
        await fetch(imageUrl).then(async (res) => {
            if (res.ok) {
                const buffer = Buffer.from(await res.arrayBuffer());
                const img = sizeOf.imageSize(buffer);

                image = {
                    url: imageUrl,
                    width: img.width ?? 0,
                    height: img.height ?? 0,
                    base64: `data:${res.headers.get('Content-Type')};base64,${buffer.toString('base64')}`,
                };
            }
        });
    }

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

    if (MIRROR_REGEX.test(link)) {
        const dataScript = document.getElementById('__NEXT_DATA__');
        const data = dataScript?.innerText ? JSON.parse(dataScript.innerText) : undefined;
        const address = data?.props?.pageProps?.publicationLayoutProject?.address;
        const digest = data?.props?.pageProps?.digest;
        const entry = data?.props?.pageProps?.__APOLLO_STATE__?.[`entry:${digest}`];
        const timestamp = entry?.publishedAtTimestamp ? entry.publishedAtTimestamp * 1000 : undefined;
        const ens = data?.props?.pageProps?.publicationLayoutProject?.ens;
        const displayName = data?.props?.pageProps?.publicationLayoutProject?.displayName;
        return {
            og,
            payload: {
                type: OpenGraphPayloadSourceType.Mirror,
                address,
                timestamp,
                ens,
                displayName,
            },
        };
    }
    return {
        og,
    };
}
