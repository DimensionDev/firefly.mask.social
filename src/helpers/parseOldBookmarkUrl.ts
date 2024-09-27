import { isBookmarkSource } from '@/helpers/isBookmarkSource.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export function parseOldBookmarkUrl(url: URL) {
    if (!url.pathname.startsWith('/bookmarks')) return null;

    const source = resolveSourceFromUrlNoFallback(url.searchParams.get('source'));

    if (!source || !isBookmarkSource(source)) return null;

    return { source };
}
