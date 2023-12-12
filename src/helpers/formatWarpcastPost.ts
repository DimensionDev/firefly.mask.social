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

export function formatWarpcastPost(cast: Cast): Post {
    return {
        type: cast.parentHash ? 'Comment' : 'Post',
        source: SocialPlatform.Farcaster,
        postId: cast.hash,
        parentPostId: cast.threadHash,
        timestamp: cast.timestamp,
        author: {
            profileId: cast.author.fid.toString(),
            nickname: cast.author.username,
            displayName: cast.author.displayName,
            pfp: cast.author.pfp.url,
            handle: cast.author.username,
            followerCount: cast.author.followerCount,
            followingCount: cast.author.followingCount,
            status: ProfileStatus.Active,
            verified: cast.author.pfp.verified,
            source: SocialPlatform.Farcaster,
        },
        metadata: {
            locale: '',
            content: formatContent(cast),
        },
        stats: {
            comments: cast.replies.count,
            mirrors: cast.recasts.count,
            quotes: cast.recasts.count,
            reactions: cast.reactions.count,
        },
        __original__: cast,
    };
}

export function formatWarpcastPostFromFeed(feed: Feed): Post {
    const firstComment = feed.replies?.length ? first(feed.replies) : undefined;
    const cast = firstComment ?? feed.cast;

    return {
        ...formatWarpcastPost(cast),
        commentOn: firstComment ? formatWarpcastPost(feed.cast) : undefined,
    };
}
