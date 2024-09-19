import urlcat from 'urlcat';

import { EngagementType, type SocialSource } from '@/constants/enum.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

export function resolveEngagementUrl(id: string, source: SocialSource, type: EngagementType) {
    return urlcat(`/post/:source/:id/:type`, {
        id,
        source: resolveSourceInUrl(source),
        type,
    });
}
