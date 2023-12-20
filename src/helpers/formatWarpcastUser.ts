import { SocialPlatform } from '@/constants/enum.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { ProfileStatus } from '@/providers/types/SocialMedia.js';
import type { Profile as WarpProfile } from '@/providers/types/Warpcast.js';

export function formatWarpcastUser(user: WarpProfile): Profile {
    return {
        profileId: user.fid.toString(),
        displayName: user.displayName,
        handle: user.username,
        fullHandle: user.username,
        pfp: user.pfp?.url,
        bio: user.profile.bio.text,
        address: user.profile.location.description,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        status: ProfileStatus.Active,
        verified: user.pfp ? user.pfp.verified : false,
        viewerContext: {
            following: user.viewerContext.following,
            followedBy: user.viewerContext.followedBy,
        },
        source: SocialPlatform.Farcaster,
    };
}
