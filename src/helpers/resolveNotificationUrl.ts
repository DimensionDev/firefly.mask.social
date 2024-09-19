import urlcat from 'urlcat';

import type { SocialDiscoverSource } from '@/constants/enum.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';

export function resolveNotificationUrl(source: SocialDiscoverSource) {
    return urlcat(`/notifications/:source`, {
        source: resolveSourceInURL(source),
    });
}
