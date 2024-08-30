import type { UserV2 } from 'twitter-api-v2';

import { Source } from '@/constants/enum.js';
import { type Profile, ProfileStatus } from '@/providers/types/SocialMedia.js';

export function convertTwitterAvatar(url: string) {
    return url.replace(/_normal.(jpe?g|png|gif|bmp)/, '_400x400.$1');
}

export function formatTwitterProfile(data: UserV2): Profile {
    const following = data?.connection_status?.some((status) => status === 'following');
    return {
        fullHandle: data.name,
        profileId: data.id,
        handle: data.username,
        displayName: data.name,
        pfp: convertTwitterAvatar(data.profile_image_url!),
        bio: data.description,
        followerCount: data.public_metrics?.followers_count ?? 0,
        followingCount: data.public_metrics?.following_count ?? 0,
        status: ProfileStatus.Active,
        verified: data.verified || false,
        source: Source.Twitter,
        viewerContext: {
            following,
        },
        website: data.url,
        location: data.location,
    };
}
