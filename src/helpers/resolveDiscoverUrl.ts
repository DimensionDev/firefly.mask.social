import urlcat from 'urlcat';

import { type DiscoverSource, DiscoverType } from '@/constants/enum.js';
import { isSocialSource } from '@/helpers/isSocialSource.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

export function resolveDiscoverUrl(source: DiscoverSource, discover: DiscoverType = DiscoverType.Trending) {
    if (isSocialSource(source)) {
        return urlcat(`/:source/:discover`, {
            source: resolveSourceInUrl(source),
            discover,
        });
    }
    return urlcat(`/:source`, {
        source: resolveSourceInUrl(source),
    });
}
