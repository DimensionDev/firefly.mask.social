import { compact, first, last } from 'lodash-es';

import { SocialPlatform } from '@/constants/enum.js';
import { URL_REGEX } from '@/constants/regex.js';
import { formatFarcasterProfileFromFirefly } from '@/helpers/formatFarcasterProfileFromFirefly.js';
import { getResourceType } from '@/helpers/getResourceType.js';
import type { Cast } from '@/providers/types/Firefly.js';
import { type Attachment, type Post, type Profile, ProfileStatus } from '@/providers/types/SocialMedia.js';

function formatContent(cast: Cast) {
    const oembedUrl = last(cast.text.match(URL_REGEX));
    const defaultContent = { content: cast.text, oembedUrl };
    if (cast.embeds.length) {
        const firstAsset = first(cast.embeds);
        if (!firstAsset) return defaultContent;

        if (!firstAsset.url) return defaultContent;

        const assetType = getResourceType(firstAsset.url);
        if (!assetType) return defaultContent;

        return {
            content: cast.text,
            oembedUrl,
            asset: {
                type: assetType,
                uri: firstAsset.url,
            } satisfies Attachment,
            attachments: compact<Attachment>(
                cast.embeds.map((x) => {
                    if (!x.url) return;

                    const type = getResourceType(x.url);
                    if (!type) return;

                    return {
                        type: assetType,
                        uri: x.url,
                    };
                }),
            ),
        };
    }
    return defaultContent;
}

export function formatFarcasterPostFromFirefly(result: Cast): Post {
    return {
        type: result.parentCast ? 'Comment' : 'Post',
        postId: result.hash,
        parentPostId: result.parent_hash,
        parentAuthor: result.parentCast ? formatFarcasterProfileFromFirefly(result.parentCast?.author) : undefined,
        timestamp: result.timestamp ? new Date(result.timestamp).getTime() : undefined,
        author: formatFarcasterProfileFromFirefly(result.author),
        metadata: {
            locale: '',
            content: formatContent(result),
        },
        stats: {
            comments: Number(result.replyCount),
            mirrors: result.recastCount,
            reactions: result.likeCount,
            quotes: 0,
        },
        mentions: result.mentions_user.map<Profile>((x) => {
            return {
                profileId: x.fid,
                displayName: x.handle,
                handle: x.handle,
                fullHandle: x.handle,
                pfp: '',
                source: SocialPlatform.Farcaster,
                followerCount: 0,
                followingCount: 0,
                status: ProfileStatus.Active,
                verified: true,
            };
        }),
        mirrors: result.recastedBy ? [formatFarcasterProfileFromFirefly(result.recastedBy)] : undefined,
        hasLiked: result.liked,
        hasMirrored: result.recasted,
        source: SocialPlatform.Farcaster,
        canComment: true,
        commentOn: result.parentCast ? formatFarcasterPostFromFirefly(result.parentCast) : undefined,
        root: result.rootParentCast ? formatFarcasterPostFromFirefly(result.rootParentCast) : undefined,
        __original__: result,
    };
}
