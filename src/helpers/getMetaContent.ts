import { q } from '@/helpers/q.js';

/**
 * Get content of meta tag with name
 * @param document
 * @param name
 * @returns
 */
export function getMetaContent(document: Document, name: string) {
    const meta = q(document, name);
    return meta?.getAttribute('content') || null;
}
