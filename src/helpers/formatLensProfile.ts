import type { HandleInfoFragment, ProfileFragment } from '@lens-protocol/client';

import { Source } from '@/constants/enum.js';
import { AVATAR } from '@/constants/index.js';
import { formatImageUrl } from '@/helpers/formatImageUrl.js';
import { getLennyUrl } from '@/helpers/getLennyUrl.js';
import { sanitizeDStorageUrl } from '@/helpers/sanitizeDStorageUrl.js';
import type { LensV3Profile } from '@/providers/types/Firefly.js';
import { NetworkType, type Profile, ProfileStatus } from '@/providers/types/SocialMedia.js';

function getAvatar(profile: ProfileFragment, namedTransform = AVATAR) {
    let avatarUrl = (profile as { avatar?: string }).avatar;

    if (profile?.metadata?.picture?.__typename === 'NftImage') {
        avatarUrl = profile.metadata.picture.image.optimized?.uri ?? profile.metadata.picture.image.raw.uri;
    } else if (profile.metadata?.picture?.__typename === 'ImageSet') {
        avatarUrl = profile.metadata.picture.optimized?.uri ?? profile.metadata.picture.raw.uri;
    } else {
        avatarUrl = getLennyUrl(profile.id);
    }

    return formatImageUrl(sanitizeDStorageUrl(avatarUrl), namedTransform);
}

export function formatLensProfile(result: ProfileFragment): Profile {
    return {
        profileId: result.id,
        profileSource: Source.Lens,
        displayName: result.metadata?.displayName || result.handle?.localName || '',
        handle: (result.handle?.localName || result.metadata?.displayName) ?? '',
        fullHandle: result.handle?.fullHandle || '',
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
            blocking: result.operations.isBlockedByMe.value,
        },
        source: Source.Lens,
        website: result.metadata?.attributes?.find((x) => x.key === 'website')?.value,
        location: result.metadata?.attributes?.find((x) => x.key === 'location')?.value,
    };
}

export function formatLensProfileByHandleInfo(result: HandleInfoFragment): Profile {
    return {
        profileId: result.id,
        profileSource: Source.Lens,
        displayName: result.localName || '',
        handle: result.localName || '',
        fullHandle: result.fullHandle || '',
        pfp: '',
        followerCount: 0,
        followingCount: 0,
        status: ProfileStatus.Active,
        verified: true,
        source: Source.Lens,
    };
}

export function formatLensProfileFromSuggestedFollow(result: LensV3Profile): Profile {
    return {
        profileId: result.id,
        profileSource: Source.Lens,
        displayName: result.localName || '',
        handle: result.localName || '',
        fullHandle: result.fullHandle || '',
        pfp: '',
        followerCount: 0,
        followingCount: 0,
        status: ProfileStatus.Active,
        verified: true,
        source: Source.Lens,
    };
}
