import urlcat from 'urlcat';

import { SearchType, Source } from '@/constants/enum.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

const TYPES_WITHOUT_SOURCE = [SearchType.Profiles, SearchType.NFTs, SearchType.Tokens];

export function resolveSearchUrl(query: string, type?: SearchType, source?: Source) {
    // TODO: Support search articles
    const resolvedSource = !source || source === Source.Article ? Source.Farcaster : source;
    const resolvedType = type || SearchType.Posts;

    const ignoreSource = TYPES_WITHOUT_SOURCE.includes(resolvedType);
    return urlcat(ignoreSource ? '/search/:type' : '/search/:source/:type', {
        type: resolvedType,
        q: query,
        source: ignoreSource ? undefined : resolveSourceInUrl(resolvedSource),
    });
}
