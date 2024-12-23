import { compact, last } from 'lodash-es';

import { Source } from '@/constants/enum.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import { formatChannelFromFirefly } from '@/helpers/formatFarcasterChannelFromFirefly.js';
import { formatFarcasterProfileFromFirefly } from '@/helpers/formatFarcasterProfileFromFirefly.js';
import { getEmbedUrls } from '@/helpers/getEmbedUrls.js';
import { composePollFrameUrl } from '@/helpers/getPollFrameUrl.js';
import { isTopLevelDomain } from '@/helpers/isTopLevelDomain.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import { isValidPollFrameUrl, resolveEmbedMediaType } from '@/helpers/resolveEmbedMediaType.js';
import { type Cast, EmbedMediaType } from '@/providers/types/Firefly.js';
import {
    type Attachment,
    type Post,
    type PostType,
    type Profile,
    ProfileStatus,
} from '@/providers/types/SocialMedia.js';

function getCoverUriFromUrl(url: string) {
    const parsed = parseUrl(url);
    if (!parsed) return '';

    if (parsed.origin === 'https://media.firefly.land' && url.endsWith('.m3u8')) {
        return url.replace(/[^/]+\.m3u8$/, 'thumbnail.jpg');
    }

    return '';
}

function formatContent(cast: Cast): Post['metadata']['content'] {
    const embedUrls: Array<{ url: string; type?: EmbedMediaType }> = cast.embed_urls?.length
        ? cast.embed_urls
        : cast.embeds;

    const oembedUrls = getEmbedUrls(
        cast.text,
        compact(
            embedUrls
                ?.filter((x) => (x.type ? [EmbedMediaType.TEXT, EmbedMediaType.FRAME].includes(x.type) : true))
                .map((x) => x.url),
        ),
    )
        .map((x) => {
            if (isValidPollFrameUrl(x)) return composePollFrameUrl(x, Source.Farcaster);
            return x;
        })
        .filter((x) => isTopLevelDomain(x));

    const defaultContent = { content: cast.text, oembedUrl: last(oembedUrls), oembedUrls };

    const attachments = embedUrls.filter((x) => {
        if (!x.url) return false;
        const type = resolveEmbedMediaType(x.url, x.type);
        if (!type) return false;
        return true;
    });

    if (attachments.length) {
        const lastAsset = last(attachments);
        if (!lastAsset?.url) return defaultContent;
        const assetType = resolveEmbedMediaType(lastAsset.url, lastAsset.type);
        if (!assetType) return defaultContent;
        return {
            content: cast.text.replace(lastAsset.url, ''),
            oembedUrl: last(oembedUrls),
            oembedUrls,
            asset: {
                type: assetType,
                uri: lastAsset.url,
                coverUri: getCoverUriFromUrl(lastAsset.url),
            } satisfies Attachment,
            attachments: compact<Attachment>(
                attachments.map((x) => {
                    if (!x.url) return;

                    const type = resolveEmbedMediaType(x.url, x.type);
                    if (!type) return;

                    return {
                        type,
                        uri: x.url,
                        coverUri: getCoverUriFromUrl(x.url),
                    };
                }),
            ),
        };
    }
    return defaultContent;
}

function getPostTypeByCast(cast: Cast) {
    if (cast.quotedCast) return 'Quote';
    if (cast.recastedBy) return 'Mirror';
    if (cast.parentCast) return 'Comment';
    return 'Post';
}

/**
 * Return null if cast is detected
 */
export function formatFarcasterPostFromFirefly(cast: Cast, type?: PostType): Post {
    const postType = type ?? getPostTypeByCast(cast);
    return {
        publicationId: cast.hash,
        type: postType,
        postId: cast.hash,
        parentPostId: cast.parent_hash,
        parentAuthor: cast.parentCast?.author ? formatFarcasterProfileFromFirefly(cast.parentCast?.author) : undefined,
        timestamp: cast.timestamp ? new Date(cast.timestamp).getTime() : undefined,
        author: cast.author ? formatFarcasterProfileFromFirefly(cast.author) : createDummyProfile(Source.Farcaster),
        isHidden: !!cast.deleted_at,
        metadata: {
            locale: '',
            content: formatContent(cast),
        },
        stats: {
            comments: Number(cast.replyCount),
            mirrors: cast.recastCount,
            quotes: cast.quotedCount,
            reactions: cast.likeCount,
        },
        mentions: cast.mentions_user.map<Profile>((x) => {
            return {
                profileId: x.fid,
                profileSource: Source.Farcaster,
                displayName: x.handle,
                handle: x.handle,
                fullHandle: x.handle,
                pfp: '',
                source: Source.Farcaster,
                followerCount: 0,
                followingCount: 0,
                status: ProfileStatus.Active,
                verified: true,
            };
        }),
        mirrors: cast.recastedBy ? [formatFarcasterProfileFromFirefly(cast.recastedBy)] : undefined,
        hasLiked: cast.liked,
        hasMirrored: cast.recasted,
        hasBookmarked: cast.bookmarked,
        source: Source.Farcaster,
        canComment: true,
        commentOn: cast.parentCast ? formatFarcasterPostFromFirefly(cast.parentCast) : undefined,
        root: cast.rootParentCast ? formatFarcasterPostFromFirefly(cast.rootParentCast) : undefined,
        threads: compact(cast.threads?.map((x) => formatFarcasterPostFromFirefly(x, 'Comment'))),
        channel: cast.channel ? formatChannelFromFirefly(cast.channel) : undefined,
        quoteOn: cast.quotedCast ? formatFarcasterPostFromFirefly(cast.quotedCast) : undefined,
        sendFrom: {
            displayName: cast.sendFrom?.display_name ?? cast.sendFrom?.name,
            name: cast.sendFrom?.name,
        },
        __original__: cast,
    };
}
