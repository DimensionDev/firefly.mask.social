import { isDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export function parseOldFollowingUrl(url: URL) {
    if (!url.pathname.startsWith('/following')) return null;
    const source = resolveSourceFromUrlNoFallback(url.searchParams.get('source'));

    if (!source || !isDiscoverSource(source)) return null;

    return { source };
}
