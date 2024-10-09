import urlcat from 'urlcat';

import { SearchType, Source } from '@/constants/enum.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

export function resolveSearchUrl(query: string, type?: SearchType, source?: Source) {
    // TODO: Support search articles
    const resolvedSource = !source || source === Source.Article ? Source.Farcaster : source;

    return urlcat('/search/:source/:type', {
        source: resolveSourceInUrl(resolvedSource),
        type: type || SearchType.Posts,
        q: query,
    });
}
