import { Source } from '@/constants/enum.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import type { TopProfile } from '@/providers/openrank/types.js';
import type { SuggestedFollowUserProfile } from '@/providers/types/SocialMedia.js';

export function formatFarcasterSuggestedFollowUserProfileFromOpenRank(
    topProfile: TopProfile,
): SuggestedFollowUserProfile {
    return {
        profileId: `${topProfile.fid}`,
        displayName: topProfile.username || topProfile.fname,
        handle: topProfile.fname,
        fullHandle: topProfile.fname || topProfile.username,
        pfp: getStampAvatarByProfileId(Source.Farcaster, `${topProfile.fid}`),
    };
}
