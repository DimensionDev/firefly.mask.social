import urlcat from 'urlcat';

import type { SocialDiscoverSource } from '@/constants/enum.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

export function resolveNotificationUrl(source: SocialDiscoverSource) {
    return urlcat(`/notifications/:source`, {
        source: resolveSourceInUrl(source),
    });
}
