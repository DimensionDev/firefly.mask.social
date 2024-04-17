import { compact, first, last, uniqBy } from 'lodash-es';

import { SocialPlatform } from '@/constants/enum.js';
import { URL_REGEX } from '@/constants/regex.js';
import { fixUrlProtocol } from '@/helpers/fixUrlProtocol.js';
import { formatFarcasterProfileFromFirefly } from '@/helpers/formatFarcasterProfileFromFirefly.js';
import { getResourceType } from '@/helpers/getResourceType.js';
import type { Cast } from '@/providers/types/Firefly.js';
import {
    type Attachment,
    type Post,
    type PostType,
    type Profile,
    ProfileStatus,
} from '@/providers/types/SocialMedia.js';

function formatContent(cast: Cast): Post['metadata']['content'] {
    const matchedUrls = [...cast.text.matchAll(URL_REGEX)].map((x) => x[0]);
    const oembedUrls = uniqBy(compact([...matchedUrls]), (x) => x.toLowerCase()).map(fixUrlProtocol);
    const oembedUrl = last(oembedUrls);
    const defaultContent = { content: cast.text, oembedUrl, oembedUrls };

    if (cast.embeds.length) {
        const firstAsset = first(cast.embeds);
        if (!firstAsset) return defaultContent;

        if (!firstAsset.url) return defaultContent;

        const assetType = getResourceType(firstAsset.url);
        if (!assetType) return defaultContent;

        return {
            content: cast.text,
            oembedUrl,
            oembedUrls,
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

export function formatFarcasterPostFromFirefly(cast: Cast, type?: PostType): Post {
    return {
        type: type ?? cast.parentCast ? 'Comment' : 'Post',
        postId: cast.hash,
        parentPostId: cast.parent_hash,
        parentAuthor: cast.parentCast ? formatFarcasterProfileFromFirefly(cast.parentCast?.author) : undefined,
        timestamp: cast.timestamp ? new Date(cast.timestamp).getTime() : undefined,
        author: formatFarcasterProfileFromFirefly(cast.author),
        metadata: {
            locale: '',
            content: formatContent(cast),
        },
        stats: {
            comments: Number(cast.replyCount),
            mirrors: cast.recastCount,
            reactions: cast.likeCount,
            quotes: 0,
        },
        mentions: cast.mentions_user.map<Profile>((x) => {
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
        mirrors: cast.recastedBy ? [formatFarcasterProfileFromFirefly(cast.recastedBy)] : undefined,
        hasLiked: cast.liked,
        hasMirrored: cast.recasted,
        source: SocialPlatform.Farcaster,
        canComment: true,
        commentOn: cast.parentCast ? formatFarcasterPostFromFirefly(cast.parentCast) : undefined,
        root: cast.rootParentCast ? formatFarcasterPostFromFirefly(cast.rootParentCast) : undefined,
        threads: cast.threads?.map((x) => formatFarcasterPostFromFirefly(x, 'Comment')),
        __original__: cast,
    };
}
