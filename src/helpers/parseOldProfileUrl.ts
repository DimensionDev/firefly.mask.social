import { isProfilePageSource } from '@/helpers/isProfilePageSource.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export function parseOldProfileUrl(url: URL) {
    if (!url.pathname.startsWith('/profile')) return null;
    const source = resolveSourceFromUrlNoFallback(url.searchParams.get('source'));
    if (!source || !isProfilePageSource(source)) return null;
    const [, , id, ...end] = url.pathname.split('/');
    if (end.length) return null;
    if (!id) return null;
    return { source, id };
}
