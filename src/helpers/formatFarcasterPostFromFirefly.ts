import { first } from 'lodash-es';

import { SocialPlatform } from '@/constants/enum.js';
import { formatFarcasterProfileFromFirefly } from '@/helpers/formatFarcasterProfileFromFirefly.js';
import { getResourceType } from '@/helpers/getResourceType.js';
import type { Cast } from '@/providers/types/Firefly.js';
import type { Attachment, Post } from '@/providers/types/SocialMedia.js';
import type { MetadataAsset } from '@/types/index.js';

function formatContent(cast: Cast) {
    const defaultContent = { content: cast.text };
    if (cast.embeds.length) {
        const firstAsset = first(cast.embeds);
        if (!firstAsset) return defaultContent;
        const assetType = getResourceType(firstAsset.url);
        if (!assetType) return defaultContent;
        return {
            content: cast.text,
            asset: {
                uri: firstAsset!.url,
                type: getResourceType(firstAsset.url),
            } as MetadataAsset,
            attachments: cast.embeds
                .map((x) => {
                    const type = getResourceType(x.url);
                    return {
                        uri: x.url,
                        type,
                    };
                })
                .filter((x) => !!x.type) as Attachment[],
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
        source: SocialPlatform.Farcaster,
        __original__: result,
    };
}
