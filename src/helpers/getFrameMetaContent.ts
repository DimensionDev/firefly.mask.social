import { getFrameClientProtocol } from '@/helpers/getFrameClientProtocol.js';
import { getMetaContent } from '@/helpers/getMetaContent.js';

/**
 * Get content of frame meta tag with frame client protocol
 * @param document
 * @param criteria
 * @returns
 */
export function getFrameMetaContent(
    document: Document,
    criteria: Record<Exclude<ReturnType<typeof getFrameClientProtocol>, undefined>, string> &
        { backup?: string },
) {
    const protocol = getFrameClientProtocol(document);
    if (!protocol) return null;

    const selector = criteria[protocol];
    const content = getMetaContent(document, selector);
    if (content) return content;

    return criteria.backup ? getMetaContent(document, criteria.backup) : null;
}
