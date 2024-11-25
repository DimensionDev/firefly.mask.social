import { first } from 'lodash-es';

import { Source } from '@/constants/enum.js';
import type { Profile as NeynarProfile } from '@/providers/types/Neynar.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function formatFarcasterProfileFromNeynar(user: NeynarProfile): Profile {
    return {
        fullHandle: user.username,
        profileId: user.fid.toString(),
        profileSource: Source.Farcaster,
        handle: user.username,
        displayName: user.display_name,
        pfp: user.pfp_url,
        bio: user.profile.bio.text,
        address: first(user.verifications),
        followerCount: user.follower_count,
        followingCount: user.following_count,
        status: user.active_status,
        source: Source.Farcaster,
        verified: user.power_badge,
        viewerContext: {
            following: user.viewer_context?.following,
            followedBy: user.viewer_context?.followed_by,
        },
    };
}
