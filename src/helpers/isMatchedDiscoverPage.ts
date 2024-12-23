import { isDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export function isMatchedDiscoverPage(pathname: string) {
    const [, sourceInUrl, type] = pathname.split('/');
    const source = resolveSourceFromUrlNoFallback(sourceInUrl);
    if (!source) return false;

    return isDiscoverSource(source) && !type;
}
