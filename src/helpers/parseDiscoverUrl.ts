import { DiscoverType } from '@/constants/enum.js';
import { DEFAULT_SOCIAL_SOURCE, DISCOVER_TYPES } from '@/constants/index.js';
import { isDiscoverSource, isSocialDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export function parseOldDiscoverUrl(url: URL) {
    if (url.pathname !== '/') return null;

    const discover = url.searchParams.get('discover') as DiscoverType;

    const source =
        resolveSourceFromUrlNoFallback(url.searchParams.get('source')) ?? (discover ? DEFAULT_SOCIAL_SOURCE : null);

    if (!source || !isDiscoverSource(source)) return null;

    if (!isSocialDiscoverSource(source)) {
        return { source };
    }

    if (!discover) return null;

    const discoverTypes = DISCOVER_TYPES[source];

    if (!discoverTypes.includes(discover)) return null;

    return { source, discover };
}
