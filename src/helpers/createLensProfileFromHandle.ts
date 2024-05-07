import { Source } from '@/constants/enum.js';
import { type Profile, ProfileStatus } from '@/providers/types/SocialMedia.js';

export function createLensProfileFromHandle(handle: string) {
    return {
        fullHandle: handle,
        source: Source.Lens,
        handle,
        profileId: '',
        displayName: handle,
        pfp: '',
        followerCount: 0,
        followingCount: 0,
        status: ProfileStatus.Active,
        verified: true,
    } satisfies Profile;
}
