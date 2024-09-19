import urlcat from 'urlcat';

import type { DiscoverSource } from '@/constants/enum.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

export function resolveFollowingUrl(source: DiscoverSource) {
    return urlcat(`/following/:source`, {
        source: resolveSourceInUrl(source),
    });
}
