import { safeUnreachable } from '@masknet/kit';

import { Source } from '@/constants/enum.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function getProfileIdentity(profile: Profile) {
    switch (profile.source) {
        case Source.Lens:
            return profile.handle;
        case Source.Twitter:
        case Source.Farcaster:
            return profile.profileId;
        default:
            safeUnreachable(profile.source);
            return;
    }
}
