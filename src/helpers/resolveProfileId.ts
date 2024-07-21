import { Source } from '@/constants/enum.js';
import { safeUnreachable } from '@/helpers/controlFlow.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function resolveProfileId(profile: Profile | null) {
    if (!profile) return;

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
