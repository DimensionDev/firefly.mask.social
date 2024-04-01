import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { SocialPlatform } from '@/constants/enum.js';
import { FIREFLY_STAMP_URL } from '@/constants/index.js';

export function getStampAvatarByProfileId(source: SocialPlatform, profileId: string) {
    switch (source) {
        case SocialPlatform.Lens:
            return urlcat(FIREFLY_STAMP_URL, '/lens/:id', { id: profileId });
        case SocialPlatform.Farcaster:
            return urlcat(FIREFLY_STAMP_URL, '/farcaster/:id', { id: profileId });
        case SocialPlatform.Twitter:
            return urlcat(FIREFLY_STAMP_URL, '/twitter/:id', { id: profileId });
        default:
            safeUnreachable(source);
            return '';
    }
}
