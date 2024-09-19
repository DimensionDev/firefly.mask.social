import { isSocialSource } from '@/helpers/isSocialSource.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export function parseOldPostUrl(url: URL) {
    if (!url.pathname.startsWith('/post')) return null;
    const source = resolveSourceFromUrlNoFallback(url.searchParams.get('source'));
    if (!source || !isSocialSource(source)) return null;
    const [, , id] = url.pathname.split('/');
    if (!id) return null;
    return { source, id };
}
