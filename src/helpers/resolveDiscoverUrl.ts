import urlcat from 'urlcat';

import type { DiscoverSource, DiscoverType } from '@/constants/enum.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';

export function resolveDiscoverUrl(source: DiscoverSource, type?: DiscoverType) {
    if (!type) {
        return urlcat(`/:source`, {
            source: resolveSourceInURL(source),
        });
    }
    return urlcat(`/:source/:type`, {
        source: resolveSourceInURL(source),
        type,
    });
}
