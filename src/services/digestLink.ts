import {
    generateIframe,
    getDescription,
    getEmbedUrl,
    getImage,
    getIsLarge,
    getSite,
    getTitle,
} from '@/helpers/getMetadata.js';
import { parseHTML } from 'linkedom';
import sizeOf from 'image-size';

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

export interface Payload {
    type: PayloadType;
}

type PayloadType = 'lens' | 'farcaster' | 'mirror' | 'snapshot' | 'nft';

export interface LinkDigest {
    og: OpenGraph;
    payload?: Payload;
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
        favicon: `https://external-content.duckduckgo.com/ip3/${link
            .replace('https://', '')
            .replace('http://', '')}.ico`,
        title: getTitle(document),
        description: getDescription(document),
        site: getSite(document),
        image,
        isLarge: getIsLarge(document),
        html: generateIframe(getEmbedUrl(document), link),
        locale: null,
    };

    return {
        og,
    };
}
