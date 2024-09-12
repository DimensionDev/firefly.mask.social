import urlcat from 'urlcat';

import { type DiscoverSource, DiscoverType } from '@/constants/enum.js';
import { isSocialSource } from '@/helpers/isSocialSource.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';

export function resolveDiscoverUrl(source: DiscoverSource, type?: DiscoverType) {
    if (isSocialSource(source)) {
        return urlcat(`/:source/:discover`, {
            source: resolveSourceInURL(source),
            discover: type ?? DiscoverType.Trending,
        });
    }
    return urlcat(`/:source`, {
        source: resolveSourceInURL(source),
    });
}
