import urlcat from 'urlcat';

import { safeUnreachable } from '@/helpers/controlFlow.js';
import { RelationPlatform } from '@/providers/types/Firefly.js';

export function getRelationPlatformUrl(platform: RelationPlatform, identity: string) {
    switch (platform) {
        case RelationPlatform.github:
            return urlcat('https://github.com/:identity', { identity });
        case RelationPlatform.reddit:
            return urlcat('https://www.reddit.com/user/:identity', { identity });
        case RelationPlatform.keybase:
            return urlcat('https://keybase.io/:identity', { identity });
        default:
            safeUnreachable(platform);
            return;
    }
}
