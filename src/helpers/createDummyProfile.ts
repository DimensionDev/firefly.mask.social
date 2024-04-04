import { SocialPlatform } from '@/constants/enum.js';
import { ProfileStatus } from '@/providers/types/SocialMedia.js';

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
        source: SocialPlatform.Twitter,
        verified: true,
    };
}
