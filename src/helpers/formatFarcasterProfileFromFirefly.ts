import { first } from 'lodash-es';

import { SocialPlatform } from '@/constants/enum.js';
import type { User } from '@/providers/types/Firefly.js';
import { type Profile, ProfileStatus } from '@/providers/types/SocialMedia.js';

export function formatFarcasterProfileFromFirefly(result: User): Profile {
    return {
        profileId: result.fid,
        displayName: result.display_name,
        handle: result.username,
        pfp: result.pfp,
        bio: result.bio,
        address: first(result.addresses),
        followerCount: result.followers,
        followingCount: result.following,
        status: ProfileStatus.Active,
        verified: true,
        source: SocialPlatform.Farcaster,
    };
}
