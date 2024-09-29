import urlcat from 'urlcat';

import { SearchType, Source } from '@/constants/enum.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

export function resolveSearchUrl(query: string, type?: SearchType, source?: Source) {
    return urlcat('/search/:source/:type', {
        source: resolveSourceInUrl(source || Source.Farcaster),
        type: type || SearchType.Posts,
        q: query,
    });
}
