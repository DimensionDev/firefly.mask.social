import urlcat from 'urlcat';

import type { FollowingSource } from '@/constants/enum.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

export function resolveFollowingUrl(source: FollowingSource) {
    return urlcat(`/following/:source`, {
        source: resolveSourceInUrl(source),
    });
}
