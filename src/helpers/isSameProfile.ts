import type { FireflyProfile } from '@/providers/types/Firefly.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function isSameProfile(profile: Profile | null | undefined, otherProfile: Profile | null | undefined) {
    if (!profile || !otherProfile) return false;
    return profile.source === otherProfile.source && profile.profileId === otherProfile.profileId;
}

export function isSameFireflyProfile(
    profile: FireflyProfile | null | undefined,
    otherProfile: FireflyProfile | null | undefined,
) {
    if (!profile?.identity || !otherProfile?.identity) return false;
    return profile.source === otherProfile.source && profile.identity === otherProfile.identity;
}
