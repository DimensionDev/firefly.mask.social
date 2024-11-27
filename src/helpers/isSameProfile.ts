import type { FireflyIdentity, Profile as FireflyProfile } from '@/providers/types/Firefly.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

type PickedProfile = Pick<Profile, 'profileId' | 'source'> | null | undefined;

export function isSameProfile(profile: PickedProfile, otherProfile: PickedProfile) {
    if (!profile || !otherProfile) return false;
    return profile.source === otherProfile.source && profile.profileId === otherProfile.profileId;
}

export function toProfileId(profile: Profile) {
    return `${profile.source}:${profile.profileId}`;
}

export function toFireflyProfileId(profile: FireflyProfile) {
    return `${profile.platform}:${profile.platform_id}`;
}

export function toFireflyIdentityId(identity: FireflyIdentity) {
    return `${identity.source}:${identity.id}`;
}
