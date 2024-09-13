import { DiscoverType } from '@/constants/enum.js';
import { DISCOVER_TYPES } from '@/constants/index.js';
import { isDiscoverSource, isSocialDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export function isMatchedDiscoverPage(pathname: string) {
    const [, sourceInUrl, type] = pathname.split('/');
    const source = resolveSourceFromUrlNoFallback(sourceInUrl);
    if (!source) return false;
    if (isSocialDiscoverSource(source) && DISCOVER_TYPES[source].includes(type as DiscoverType)) return true;
    return isDiscoverSource(source) && !type;
}
