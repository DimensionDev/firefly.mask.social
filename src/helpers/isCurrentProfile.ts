import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function isCurrentProfile(profile: Profile) {
    return isSameProfile(profile, getCurrentProfile(profile.source));
}
