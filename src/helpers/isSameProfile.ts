import type { Profile } from '@/providers/types/SocialMedia.js';

export function isSameProfile(profile: Profile | null | undefined, otherProfile: Profile | null | undefined) {
    if (!profile || !otherProfile) return false;
    return profile.source === otherProfile.source && profile.profileId === otherProfile.profileId;
}
