import { DiscoverType } from '@/constants/enum.js';
import { DISCOVER_TYPES } from '@/constants/index.js';
import { isDiscoverSource, isSocialDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export function parseOldDiscoverUrl(url: URL) {
    if (url.pathname !== '/') return null;

    const source = resolveSourceFromUrlNoFallback(url.searchParams.get('source'));

    if (!source || !isDiscoverSource(source)) return null;

    if (!isSocialDiscoverSource(source)) {
        return { source };
    }

    const discover = url.searchParams.get('discover') as DiscoverType;

    if (!discover) return null;

    const discoverTypes = DISCOVER_TYPES[source];

    if (!discoverTypes.includes(discover)) return null;

    return { source, discover };
}
