import { isSocialSource } from '@/helpers/isSocialSource.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export function parseOldPostUrl(url: URL) {
    if (!url.pathname.startsWith('/post')) return null;
    const source = resolveSourceFromUrlNoFallback(url.searchParams.get('source'));
    if (!source || !isSocialSource(source)) return null;
    const [, , id] = url.pathname.split('/');
    if (!id) return null;
    return { source, id };
}

export function parsePostUrl(url: string) {
    const parsedUrl = parseUrl(url);
    if (!parsedUrl) return null;
    if (!parsedUrl.pathname.startsWith('/post')) return null;
    const [, , sourceInUrl, id] = parsedUrl.pathname.split('/');
    const source = resolveSourceFromUrlNoFallback(sourceInUrl);
    if (!source || !isSocialSource(source)) return null;
    if (!id) return null;
    return { source, id };
}
