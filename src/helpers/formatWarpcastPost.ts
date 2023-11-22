import { first, union } from 'lodash-es';

import { SocialPlatform } from '@/constants/enum.js';
import { type Attachment, type Post, ProfileStatus } from '@/providers/types/SocialMedia.js';
import type { Cast, Feed } from '@/providers/types/Warpcast.js';
import type { MetadataAsset } from '@/types/index.js';

export function getAttachments(cast: Cast) {
    const images = cast.embeds?.images.map<Attachment>((x) => ({ uri: x.url, type: 'Image' }));
    const videos = cast.embeds?.videos.map<Attachment>((x) => ({ uri: x.url, type: 'Video' }));
    return union<Attachment>(images, videos);
}

export function formatContent(cast: Cast) {
    if (cast.embeds?.images.length) {
        return {
            content: cast.text,
            asset: {
                uri: first(cast.embeds.images)!.url,
                type: 'Image',
            } as MetadataAsset,
            attachments: getAttachments(cast),
        };
    } else if (cast.embeds?.videos.length) {
        return {
            content: cast.text,
            asset: {
                uri: first(cast.embeds.videos)!.url,
                type: 'Video',
            } as MetadataAsset,
            attachments: getAttachments(cast),
        };
    }
    return {
        content: cast.text,
        attachments: getAttachments(cast),
    };
}

export default function formatWarpcastPost(feed: Feed): Post {
    return {
        source: SocialPlatform.Farcaster,
        postId: feed.cast.hash,
        parentPostId: feed.cast.threadHash,
        timestamp: feed.timestamp,
        author: {
            profileId: feed.cast.author.fid.toString(),
            nickname: feed.cast.author.username,
            displayName: feed.cast.author.displayName,
            pfp: feed.cast.author.pfp.url,
            followerCount: feed.cast.author.followerCount,
            followingCount: feed.cast.author.followingCount,
            status: ProfileStatus.Active,
            verified: feed.cast.author.pfp.verified,
        },
        metadata: {
            locale: '',
            content: formatContent(feed.cast),
        },
        stats: {
            comments: feed.cast.replies.count,
            mirrors: feed.cast.recasts.count,
            quotes: feed.cast.recasts.count,
            reactions: feed.cast.reactions.count,
        },
        __original__: feed,
    };
}
