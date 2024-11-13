import urlcat from 'urlcat';

import { type DiscoverSource } from '@/constants/enum.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

export function resolveDiscoverUrl(source: DiscoverSource) {
    return urlcat(`/:source`, {
        source: resolveSourceInUrl(source),
    });
}
