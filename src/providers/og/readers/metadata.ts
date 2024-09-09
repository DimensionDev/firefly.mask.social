/* cspell:disable */

import { getMetaContent } from '@/helpers/getMetaContent.js';
import { qAny } from '@/helpers/q.js';

export function getTitle(document: Document): string | null {
    const meta = qAny(document, ['lens:title', 'og:title', 'twitter:title']);
    return meta?.getAttribute('content') || document.querySelector('title')?.textContent || document.domain;
}

export function getDescription(document: Document): string | null {
    const meta = qAny(document, ['lens:description', 'og:description', 'twitter:description', 'description']);
    return meta?.getAttribute('content') || null;
}

export function getSite(document: Document): string | null {
    const meta = qAny(document, ['lens:site', 'og:site_name', 'twitter:site']);
    return meta?.getAttribute('content') || null;
}

export function getImageUrl(document: Document): string | null {
    const meta = qAny(document, ['lens:image', 'og:image', 'twitter:image', 'twitter:image:src']);
    return meta?.getAttribute('content') || null;
}

export function getEmbedUrl(document: Document): string | null {
    const meta = qAny(document, ['lens:player', 'og:video:url', 'og:video:secure_url', 'twitter:player']);
    return meta?.getAttribute('content') || null;
}

export function getIsLarge(document: Document): boolean {
    const lens = getMetaContent(document, 'lens:card');
    const twitter = getMetaContent(document, 'twitter:card');

    const largeTypes = ['summary_large_image', 'player'];

    if (lens) {
        return largeTypes.includes(lens);
    } else if (twitter) {
        return largeTypes.includes(twitter);
    } else {
        return false;
    }
}
