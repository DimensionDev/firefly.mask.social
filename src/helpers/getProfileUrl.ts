import { safeUnreachable } from '@masknet/kit';

import { Source } from '@/constants/enum.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function getProfileUrl(profile: Profile) {
    switch (profile.source) {
        case Source.Lens:
            if (!profile.handle) return '';
            return resolveProfileUrl(profile.source, profile.handle);
        case Source.Farcaster:
            if (!profile.profileId) return '';
            return resolveProfileUrl(profile.source, profile.profileId);
        case Source.Twitter:
            if (!profile.profileId) return '';
            return resolveProfileUrl(profile.source, profile.profileId);
        default:
            safeUnreachable(profile.source);
            return '';
    }
}
