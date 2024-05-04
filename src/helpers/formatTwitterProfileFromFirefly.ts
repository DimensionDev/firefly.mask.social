import type { UserV2 } from 'twitter-api-v2';

import { SocialPlatform } from '@/constants/enum.js';
import { type Profile, ProfileStatus } from '@/providers/types/SocialMedia.js';

export function formatTwitterProfileFromFirefly(data: UserV2): Profile {
    const following = data?.connection_status?.some(status => status === 'following')
    return {
        fullHandle: data.name,
        profileId: data.id,
        handle: data.username,
        displayName: data.name,
        pfp: data.profile_image_url!,
        bio: data.description,
        followerCount: data.public_metrics?.followers_count ?? 0,
        followingCount: data.public_metrics?.following_count ?? 0,
        status: ProfileStatus.Active,
        verified: true,
        source: SocialPlatform.Twitter,
        viewerContext: {
            following,
        }
    }
}
