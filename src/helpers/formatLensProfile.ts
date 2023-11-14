import type { ProfileFragment } from '@lens-protocol/client';
import { ProfileStatus, NetworkType, type Profile } from '@/providers/types/SocialMedia.js';

export default function formatLensProfile(result: ProfileFragment): Profile {
    return {
        profileId: result.id,
        nickname: result.metadata?.displayName ?? '',
        displayName: result.metadata?.displayName ?? '',
        pfp:
            result.metadata?.picture?.__typename === 'ImageSet'
                ? result.metadata?.picture?.raw.uri
                : result.metadata?.picture?.__typename === 'NftImage'
                  ? result.metadata?.picture?.image.raw.uri
                  : '',
        bio: result.metadata?.bio ?? undefined,
        address: result.followNftAddress?.address ?? undefined,
        followerCount: result.stats.followers,
        followingCount: result.stats.following,
        status: ProfileStatus.Active,
        verified: true,
        ownedBy: {
            networkType: NetworkType.Ethereum,
            address: result.ownedBy.address,
        },
    };
}
