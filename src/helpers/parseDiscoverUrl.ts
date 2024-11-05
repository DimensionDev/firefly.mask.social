import { ExploreType } from '@/constants/enum.js';
import { DEFAULT_SOCIAL_SOURCE } from '@/constants/index.js';
import { isDiscoverSource, isSocialDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export function parseOldDiscoverUrl(url: URL) {
    if (url.pathname !== '/') return null;

    const discoverInParam = url.searchParams.get('discover');
    const sourceInParam =
        resolveSourceFromUrlNoFallback(url.searchParams.get('source')) ??
        (discoverInParam ? DEFAULT_SOCIAL_SOURCE : null);

    const [, sourceInUrl, discoverInUrl] = url.pathname.split('/');
    const resolvedSource = resolveSourceFromUrlNoFallback(sourceInUrl);

    const source = resolvedSource || sourceInParam;
    const discover = discoverInUrl || discoverInParam;

    if (!source || !isDiscoverSource(source)) return null;

    if (!isSocialDiscoverSource(source)) {
        return { source };
    }

    if (!discover) return null;

    if (discover === ExploreType.TopChannels || discover === ExploreType.TopProfiles) {
        return { source, exploreType: discover };
    }

    return { source };
}
