import { PageRoute } from '@/constants/enum.js';
import { DEFAULT_SOCIAL_SOURCE } from '@/constants/index.js';
import { isDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export function parseOldFollowingUrl(url: URL) {
    if (!url.pathname.startsWith(PageRoute.Following)) return null;

    const source = isRoutePathname(url.pathname, PageRoute.Following, true)
        ? DEFAULT_SOCIAL_SOURCE
        : resolveSourceFromUrlNoFallback(url.searchParams.get('source'));

    if (!source || !isDiscoverSource(source)) return null;

    return { source };
}
