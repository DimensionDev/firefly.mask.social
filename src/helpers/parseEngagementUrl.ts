import { isEngagementType } from '@/helpers/isEngagementType.js';
import { isSocialSource } from '@/helpers/isSocialSource.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export function parseOldEngagementUrl(url: URL) {
    if (!url.pathname.startsWith('/post')) return null;
    const source = resolveSourceFromUrlNoFallback(url.searchParams.get('source'));
    if (!source || !isSocialSource(source)) return null;
    const [, , id, engagement] = url.pathname.split('/');
    if (!id) return null;
    if (!engagement || !isEngagementType(engagement)) return null;
    return { source, id, engagement };
}
