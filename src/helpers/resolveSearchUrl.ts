import urlcat from 'urlcat';

import { SearchType } from '@/constants/enum.js';

export function resolveSearchUrl(query: string, type?: SearchType) {
    return urlcat('/search/:type', { type: type || SearchType.Posts, q: query });
}
