import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { SocialPlatform } from '@/constants/enum.js';
import { FIREFLY_STAMP_URL } from '@/constants/index.js';

export function getStampAvatarByProfileId(source: SocialPlatform, id: string) {
    switch (source) {
        case SocialPlatform.Lens:
            return urlcat(FIREFLY_STAMP_URL, '/lens/:id', { id });
        case SocialPlatform.Farcaster:
            return urlcat(FIREFLY_STAMP_URL, '/farcaster/:id', { id });
        default:
            safeUnreachable(source);
            return urlcat(FIREFLY_STAMP_URL, '/:id', { id });
    }
}
