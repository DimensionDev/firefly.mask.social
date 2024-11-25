import { type SocialSource, Source } from '@/constants/enum.js';
import { type Profile, ProfileStatus } from '@/providers/types/SocialMedia.js';

export function createDummyProfile(source: SocialSource) {
    return {
        source,
        profileId: '',
        profileSource: Source.Farcaster,
        handle: '',
        pfp: '',
        displayName: '',
        followerCount: 0,
        followingCount: 0,
        fullHandle: '',
        status: ProfileStatus.Active,
        verified: true,
    } satisfies Profile;
}

export function createDummyProfileFromFireflyAccountId(accountId: string) {
    return {
        ...createDummyProfile(Source.Farcaster),
        profileId: accountId,
    };
}

export function createDummyProfileFromLensHandle(handle: string) {
    return {
        ...createDummyProfile(Source.Lens),
        handle,
    };
}
