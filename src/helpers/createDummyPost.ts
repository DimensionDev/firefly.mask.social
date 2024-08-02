import { compact } from 'lodash-es';
import { v4 as uuid } from 'uuid';

import { type SocialSource, Source } from '@/constants/enum.js';
import { readChars } from '@/helpers/chars.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfile.js';
import { resolveMediaObjectUrl } from '@/helpers/resolveMediaObjectUrl.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { CompositePost } from '@/store/useComposeStore.js';

export function createDummyPost(source: SocialSource, content: string, url?: string) {
    return {
        publicationId: '',
        postId: source === Source.Farcaster ? '0x0000000000000000000000000000000000000000' : '',
        author: createDummyProfile(source),
        metadata: {
            locale: 'en',
            content: {
                oembedUrl: url,
                oembedUrls: url ? [url] : [],
                content,
            },
        },
        source,
    } satisfies Post;
}

export function createDummyCommentPost(source: SocialSource, compositePost: CompositePost): Post | null {
    const allProfiles = getCurrentProfileAll();
    const parentPost = compositePost.parentPost[source];
    const postId = compositePost.postId[source];
    if (!parentPost || !postId) return null;
    return {
        publicationId: uuid(),
        type: 'Comment',
        source,
        postId,
        parentPostId: parentPost.postId,
        parentAuthor: parentPost.author,
        timestamp: Date.now(),
        author: allProfiles[source]!,
        mediaObjects: compact([compositePost.video, ...compositePost.images, ...compositePost.images]).map((x) => ({
            title: x.file.name,
            mimeType: x.mimeType,
            url: resolveMediaObjectUrl(x),
        })),
        metadata: {
            locale: '',
            content: {
                content: readChars(compositePost.chars),
            },
        },
    };
}
