import { Source } from '@/constants/enum.js';
import { bom } from '@/helpers/bom.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';

export function getCurrentSourceFromUrl() {
    if (!bom.document) return Source.Farcaster;
    const searchParams = new URLSearchParams(location.search);
    const source = searchParams.get('source');
    if (!source) return Source.Farcaster;
    return resolveSourceFromUrl(source);
}

export function getCurrentSourceFromParams(params: URLSearchParams) {
    const source = params.get('source');
    if (!source) return Source.Farcaster;
    return resolveSourceFromUrl(source);
}
