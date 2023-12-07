import { SocialPlatform } from '@/constants/enum.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { ProfileStatus } from '@/providers/types/SocialMedia.js';
import type { Profile as WarpProfile } from '@/providers/types/Warpcast.js';

export function formatWarpcastUser(user: WarpProfile): Profile {
    return {
        profileId: user.fid.toString(),
        nickname: user.username,
        displayName: user.displayName,
        pfp: user.pfp.url,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        status: ProfileStatus.Active,
        verified: user.pfp.verified,
        viewerContext: {
            following: user.viewerContext.following,
            followedBy: user.viewerContext.followedBy,
        },
        source: SocialPlatform.Farcaster,
    };
}
