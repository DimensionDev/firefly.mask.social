import { DEFAULT_SOCIAL_SOURCE } from '@/constants/index.js';
import { isSocialDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export function parseOldNotification(url: URL) {
    if (url.pathname !== '/notifications') return null;

    const source = resolveSourceFromUrlNoFallback(url.searchParams.get('source')) ?? DEFAULT_SOCIAL_SOURCE;

    if (!source || !isSocialDiscoverSource(source)) return null;

    return { source };
}
