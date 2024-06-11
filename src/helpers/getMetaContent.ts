import { q } from '@/helpers/q.js';

export function getFrameClientProtocol(document: Document) {
    const ofVersion = getMetaContent(document, 'of:version');
    if (ofVersion) return 'of';

    const fcVersion = getMetaContent(document, 'fc:frame');
    if (fcVersion) return 'fc';

    return;
}

/**
 * Get content of meta tag with name
 * @param document
 * @param name
 * @returns
 */
export function getMetaContent(
    document: Document,
    criteria: string | Record<Exclude<ReturnType<typeof getFrameClientProtocol>, undefined>, string>,
) {
    const protocol = getFrameClientProtocol(document);
    if (!protocol) return null;

    const selector = typeof criteria === 'string' ? criteria : criteria[protocol];
    const meta = q(document, selector);
    return meta?.getAttribute('content') || null;
}
