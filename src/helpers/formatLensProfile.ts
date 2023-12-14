import type { ProfileFragment } from '@lens-protocol/client';

import { SocialPlatform } from '@/constants/enum.js';
import { AVATAR } from '@/constants/index.js';
import { formatImageUrl } from '@/helpers/formatImageUrl.js';
import { getStampFyiURL } from '@/helpers/getStampFyiURL.js';
import { sanitizeDStorageUrl } from '@/helpers/sanitizeDStorageUrl.js';
import { NetworkType, type Profile, ProfileStatus } from '@/providers/types/SocialMedia.js';

function getAvatar(profile: ProfileFragment, namedTransform = AVATAR) {
    let avatarUrl;

    if (profile?.metadata?.picture?.__typename === 'NftImage') {
        avatarUrl = profile.metadata.picture.image.optimized?.uri ?? profile.metadata.picture.image.raw.uri;
    } else if (profile.metadata?.picture?.__typename === 'ImageSet') {
        avatarUrl = profile.metadata.picture.optimized?.uri ?? profile.metadata.picture.raw.uri;
    } else {
        avatarUrl = profile.ownedBy.address ? getStampFyiURL(profile.ownedBy.address) : '';
    }

    return formatImageUrl(sanitizeDStorageUrl(avatarUrl), namedTransform);
}

export function formatLensProfile(result: ProfileFragment): Profile {
    return {
        profileId: result.id,
        displayName: result.metadata?.displayName ?? result.handle?.localName ?? '',
        handle: result.handle?.localName ?? '',
        pfp: getAvatar(result),
        bio: result.metadata?.bio ?? undefined,
        address: result.followNftAddress?.address ?? undefined,
        followerCount: result.stats.followers,
        followingCount: result.stats.following,
        status: ProfileStatus.Active,
        verified: true,
        signless: result.signless,
        ownedBy: {
            networkType: NetworkType.Ethereum,
            address: result.ownedBy.address,
        },
        viewerContext: {
            following: result.operations.isFollowedByMe.value,
            followedBy: result.operations.isFollowingMe.value,
        },
        source: SocialPlatform.Lens,
    };
}
