import { parseURL } from '@/helpers/parseURL.js';

export function isSameOriginUrl(source: string, target: string) {
    const sourceUrl = parseURL(source);
    const targetUrl = parseURL(target);

    if (!sourceUrl || !targetUrl) return false;

    return sourceUrl.origin === targetUrl.origin;
}
