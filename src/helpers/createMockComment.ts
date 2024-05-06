import { compact } from 'lodash-es';
import { v4 as uuid } from 'uuid';

import type { SocialPlatform } from '@/constants/enum.js';
import { readChars } from '@/helpers/chars.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfileAll.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { CompositePost } from '@/store/useComposeStore.js';

export function createMockComment(source: SocialPlatform, compositePost: CompositePost): Post | null {
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
            mimeType: x.file.type,
            url: x.ipfs?.uri || x.s3 || x.imgur || '',
        })),
        metadata: {
            locale: '',
            content: {
                content: readChars(compositePost.chars),
            },
        },
    };
}
