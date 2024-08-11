import type { Profile } from '@/providers/types/SocialMedia.js';

type PickedProfile = Pick<Profile, 'profileId' | 'source'> | null | undefined;

export function isSameProfile(profile: PickedProfile, otherProfile: PickedProfile) {
    if (!profile || !otherProfile) return false;
    return profile.source === otherProfile.source && profile.profileId === otherProfile.profileId;
}
