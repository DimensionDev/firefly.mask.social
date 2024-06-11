import { getFrameClientProtocol } from '@/helpers/getFrameClientProtocol.js';
import { q } from '@/helpers/q.js';

/**
 * Get content of meta tag with name
 * @param document
 * @param name
 * @param useBuiltInPrefix
 * @returns
 */
export function getMetaContent(document: Document, name: string, useBuiltInPrefix = false) {
    const prefix = useBuiltInPrefix ? `${getFrameClientProtocol(document)}:` : '';
    const meta = q(document, `${prefix}${name}`);
    return meta?.getAttribute('content') || null;
}
