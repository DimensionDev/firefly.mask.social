import { first } from 'lodash-es';

import { Source } from '@/constants/enum.js';
import type { User } from '@/providers/types/Firefly.js';
import { type Profile, ProfileStatus } from '@/providers/types/SocialMedia.js';

export function formatFarcasterProfileFromFirefly(user: User): Profile {
    return {
        fullHandle: user.username || user.display_name,
        profileId: user.fid.toString(),
        handle: user.username,
        displayName: user.display_name,
        pfp: user.pfp,
        bio: user.bio,
        address: first(user.addresses),
        followerCount: user.followers,
        followingCount: user.following,
        status: ProfileStatus.Active,
        verified: true,
        source: Source.Farcaster,
        viewerContext: {
            following: user.isFollowing,
            followedBy: user.isFollowedBack,
        },
        isPowerUser: user.isPowerUser ?? false,
    };
}
