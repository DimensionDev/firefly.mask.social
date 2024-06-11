import { getFrameClientProtocol } from '@/helpers/getFrameClientProtocol.js';
import { q } from '@/helpers/q.js';

/**
 * Get content of meta tag with name
 * @param document
 * @param name
 * @returns
 */
export function getMetaContent(
    document: Document,
    criteria: Record<Exclude<ReturnType<typeof getFrameClientProtocol>, undefined>, string> &
        Partial<Record<'og', string>>,
) {
    const protocol = getFrameClientProtocol(document);
    if (!protocol) return null;

    const selector = criteria[protocol];
    const meta = q(document, selector);
    if (meta) return meta.getAttribute('content');

    const ogSelector = typeof criteria === 'string' ? undefined : criteria.og;
    const ogMeta = ogSelector ? q(document, ogSelector) : null;
    if (ogMeta) return ogMeta.getAttribute('content');

    return null;
}
