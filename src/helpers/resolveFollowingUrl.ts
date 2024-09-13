import urlcat from 'urlcat';

import type { DiscoverSource } from '@/constants/enum.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';

export function resolveFollowingUrl(source: DiscoverSource) {
    return urlcat(`/following/:source`, {
        source: resolveSourceInURL(source),
    });
}
