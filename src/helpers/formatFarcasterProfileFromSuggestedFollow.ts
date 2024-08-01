import { Source } from '@/constants/enum.js';
import type { FarcasterSuggestedFollowUser } from '@/providers/types/Firefly.js';
import { type Profile, ProfileStatus } from '@/providers/types/SocialMedia.js';

export function formatFarcasterProfileFromSuggestedFollow(user: FarcasterSuggestedFollowUser): Profile {
    return {
        followerCount: user.followers,
        followingCount: user.following,
        source: Source.Farcaster,
        status: ProfileStatus.Active,
        verified: false,
        fullHandle: user.username,
        profileId: `${user.fid}`,
        handle: user.username,
        displayName: user.display_name,
        pfp: user.pfp,
        bio: user.bio,
        viewerContext: {
            following: user.isFollowing,
            followedBy: user.isFollowedBack,
        },
    };
}
