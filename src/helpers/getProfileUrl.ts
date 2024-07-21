import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { safeUnreachable } from '@/helpers/controlFlow.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function getProfileUrl(profile: Profile) {
    switch (profile.source) {
        case Source.Lens:
            if (!profile.handle) return '';
            return urlcat('/profile/:id', {
                source: profile.source.toLowerCase(),
                id: profile.handle,
            });
        case Source.Farcaster:
            if (!profile.profileId) return '';
            return urlcat('/profile/:id', {
                source: profile.source.toLowerCase(),
                id: profile.profileId,
            });
        case Source.Twitter:
            if (!profile.profileId) return '';
            return urlcat('/profile/:id', {
                source: profile.source.toLowerCase(),
                id: profile.profileId,
            });
        default:
            safeUnreachable(profile.source);
            return '';
    }
}
