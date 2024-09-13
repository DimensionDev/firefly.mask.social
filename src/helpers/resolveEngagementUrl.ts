import urlcat from 'urlcat';

import { EngagementType, type SocialSource } from '@/constants/enum.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';

export function resolveEngagementUrl(id: string, source: SocialSource, type: EngagementType) {
    return urlcat(`/post/:source/:id/:type`, {
        id,
        source: resolveSourceInURL(source),
        type,
    });
}
