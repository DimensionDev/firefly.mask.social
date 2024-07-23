import { parseURL } from '@/helpers/parseURL.js';

export function isSameOriginUrl(source: string | URL, target: string | URL) {
    const sourceUrl = typeof source === 'string' ? parseURL(source) : source;
    const targetUrl = typeof target === 'string' ? parseURL(target) : target;

    if (!sourceUrl || !targetUrl) return false;

    return sourceUrl.origin === targetUrl.origin;
}
