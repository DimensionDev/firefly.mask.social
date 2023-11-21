import type { ProfileFragment } from '@lens-protocol/client';
import { ProfileStatus, NetworkType, type Profile } from '@/providers/types/SocialMedia.js';
import getStampFyiURL from '@/helpers/getStampFyiURL.js';
import { zeroAddress } from 'viem';
import { LENS_MEDIA_SNAPSHOT_URL, IPFS_GATEWAY, ARWEAVE_GATEWAY, AVATAR } from '@/constants/index.js';

function imageKit(url: string, name?: string) {
    if (!url) {
        return '';
    }

    if (url.includes(LENS_MEDIA_SNAPSHOT_URL)) {
        const splitedUrl = url.split('/');
        const path = splitedUrl[splitedUrl.length - 1];

        return name ? `${LENS_MEDIA_SNAPSHOT_URL}/${name}/${path}` : url;
    }

    return url;
}

function sanitizeDStorageUrl(hash?: string) {
    if (!hash) {
        return '';
    }

    let link = hash.replace(/^Qm[1-9A-Za-z]{44}/gm, `${IPFS_GATEWAY}${hash}`);
    link = link.replace('https://ipfs.io/ipfs/', IPFS_GATEWAY);
    link = link.replace('ipfs://ipfs/', IPFS_GATEWAY);
    link = link.replace('ipfs://', IPFS_GATEWAY);
    link = link.replace('ar://', ARWEAVE_GATEWAY);

    return link;
}

function getAvatar(profile: ProfileFragment, namedTransform = AVATAR) {
    let avatarUrl;

    if (profile?.metadata?.picture?.__typename === 'NftImage') {
        avatarUrl = profile.metadata.picture.image.optimized?.uri ?? profile.metadata.picture.image.raw.uri;
    } else if (profile.metadata?.picture?.__typename === 'ImageSet') {
        avatarUrl = profile.metadata.picture.optimized?.uri ?? profile.metadata.picture.raw.uri;
    } else {
        avatarUrl = getStampFyiURL(profile.ownedBy.address ?? zeroAddress);
    }

    return imageKit(sanitizeDStorageUrl(avatarUrl), namedTransform);
}

export default function formatLensProfile(result: ProfileFragment): Profile {
    return {
        profileId: result.id,
        nickname: result.metadata?.displayName ?? '',
        displayName: result.handle?.localName ?? '',
        pfp: getAvatar(result),
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
        viewerContext: {
            following: result.operations.isFollowedByMe.value,
            followedBy: result.operations.isFollowingMe.value,
        },
    };
}
