import { safeUnreachable } from "@masknet/kit";

import { SocialPlatform } from "@/constants/enum.js";
import type { Profile } from "@/providers/types/SocialMedia.js";

export function getProfileUrl(profile: Profile) {
    switch (profile.source) {
        case SocialPlatform.Lens:
            return `/profile/${profile.handle}`
            case SocialPlatform.Farcaster:
                return `/profile/${profile.profileId}`
            default:
                safeUnreachable(profile.source)
                return ''
    }
}
