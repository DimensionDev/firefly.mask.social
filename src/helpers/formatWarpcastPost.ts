import { first, last, union } from 'lodash-es';

import { Source } from '@/constants/enum.js';
import { URL_REGEX } from '@/constants/regexp.js';
import { type Attachment, type Post, ProfileStatus } from '@/providers/types/SocialMedia.js';
import type { Cast, Feed } from '@/providers/types/Warpcast.js';

function getAttachments(cast: Cast) {
    const images = cast.embeds?.images?.map<Attachment>((x) => ({ uri: x.url, type: 'Image' }));
    const videos = cast.embeds?.videos?.map<Attachment>((x) => ({ uri: x.url, type: 'Video' }));
    return union<Attachment>(images, videos);
}

export function formatContent(cast: Cast) {
    const oembedUrl = last(cast.text.match(URL_REGEX) || []);

    if (cast.embeds?.images?.length) {
        return {
            content: cast.text,
            oembedUrl,
            asset: {
                uri: first(cast.embeds.images)!.url,
                type: 'Image',
            } satisfies Attachment,
            attachments: getAttachments(cast),
        };
    } else if (cast.embeds?.videos?.length) {
        return {
            content: cast.text,
            oembedUrl,
            asset: {
                uri: first(cast.embeds.videos)!.url,
                type: 'Video',
            } satisfies Attachment,
            attachments: getAttachments(cast),
        };
    }

    return {
        content: cast.text,
        oembedUrl,
        attachments: getAttachments(cast),
    };
}

export function formatWarpcastPost(cast: Cast): Post {
    return {
        publicationId: cast.hash,
        type: cast.parentHash ? 'Comment' : 'Post',
        source: Source.Farcaster,
        postId: cast.hash,
        parentPostId: cast.threadHash,
        timestamp: cast.timestamp,
        author: {
            fullHandle: cast.author.username,
            profileId: cast.author.fid.toString(),
            displayName: cast.author.displayName,
            pfp: cast.author.pfp?.url ?? '',
            handle: cast.author.username,
            followerCount: cast.author.followerCount,
            followingCount: cast.author.followingCount,
            status: ProfileStatus.Active,
            verified: cast.author.pfp?.verified ?? false,
            source: Source.Farcaster,
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
        mirrors: cast.recasts.recasters?.map((x) => ({
            fullHandle: x.username,
            profileId: x.fid.toString(),
            displayName: x.displayName,
            handle: x.username,
            pfp: '',
            followerCount: 0,
            followingCount: 0,
            status: ProfileStatus.Active,
            verified: true,
            source: Source.Farcaster,
        })),
        mentions: cast.mentions?.map((x) => ({
            fullHandle: x.username,
            profileId: x.fid.toString(),
            displayName: x.displayName,
            handle: x.username,
            pfp: '',
            followerCount: x.followerCount,
            followingCount: x.followingCount,
            status: ProfileStatus.Active,
            verified: x.pfp?.verified ?? false,
            source: Source.Farcaster,
        })),
        hasLiked: cast.viewerContext?.reacted,
        hasMirrored: cast.viewerContext?.recast,
        canComment: true,
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
