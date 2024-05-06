import { Source } from '@/constants/enum.js';
import { type Profile, ProfileStatus } from '@/providers/types/SocialMedia.js';

export function createDummyProfile() {
    return {
        profileId: '',
        handle: '',
        pfp: '',
        displayName: '',
        followerCount: 0,
        followingCount: 0,
        fullHandle: '',
        status: ProfileStatus.Active,
        source: Source.Twitter,
        verified: true,
    } satisfies Profile;
}
