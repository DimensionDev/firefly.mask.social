import { parseUrl } from '@/helpers/parseUrl.js';

export function isSameOriginUrl(source: string | URL, target: string | URL) {
    const sourceUrl = typeof source === 'string' ? parseUrl(source) : source;
    const targetUrl = typeof target === 'string' ? parseUrl(target) : target;

    if (!sourceUrl || !targetUrl) return false;

    return sourceUrl.origin === targetUrl.origin;
}
