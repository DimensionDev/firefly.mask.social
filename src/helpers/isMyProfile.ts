import { safeUnreachable } from '@masknet/kit';

import { type SocialSource, Source } from '@/constants/enum.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';

export function isMyProfile(source: SocialSource, handleOrProfileId: string) {
    const currentProfile = getCurrentProfile(source);
    if (!currentProfile) return false;
    switch (currentProfile.source) {
        case Source.Lens:
            return currentProfile.handle === handleOrProfileId;
        case Source.Farcaster:
            return currentProfile.profileId === handleOrProfileId;
        case Source.Twitter:
            return currentProfile.profileId === handleOrProfileId;
        default:
            safeUnreachable(currentProfile.source);
            return false;
    }
}
