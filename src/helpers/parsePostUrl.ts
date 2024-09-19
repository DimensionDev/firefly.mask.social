import { isSocialSource } from '@/helpers/isSocialSource.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';

export function parseOldPostUrl(url: URL) {
    if (!url.pathname.startsWith('/post')) return null;
    const sourceInUrl = url.searchParams.get('source') ?? '';
    const source = resolveSourceFromUrl(sourceInUrl);
    if (!isSocialSource(source)) return null;
    const [, , id, ...end] = url.pathname.split('/');
    if (end.join('/') !== '/') return null;
    if (isSocialSource(id)) return null;
    if (!id) return null;
    return { source, id };
}
