import { safeUnreachable } from '@masknet/kit';

import { Source } from '@/constants/enum.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function isMyProfile(profile: Profile) {
    const currentProfile = getCurrentProfile(profile.source);
    if (!currentProfile) return false;
    switch (currentProfile.source) {
        case Source.Lens:
            return currentProfile.handle === profile.handle;
        case Source.Farcaster:
            return currentProfile.profileId === profile.profileId;
        case Source.Twitter:
            return currentProfile.profileId === profile.profileId;
        default:
            safeUnreachable(currentProfile.source);
            return false;
    }
}
