import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { SocialPlatform } from '@/constants/enum.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function getProfileUrl(profile: Profile) {
    switch (profile.source) {
        case SocialPlatform.Lens:
            return urlcat('/profile/:source/:id', {
                source: profile.source.toLowerCase(),
                id: profile.handle,
            });
        case SocialPlatform.Farcaster:
            return urlcat('/profile/:source/:id', {
                source: profile.source.toLowerCase(),
                id: profile.profileId,
            });
        default:
            safeUnreachable(profile.source);
            return '';
    }
}
