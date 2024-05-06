import type { Source } from '@/constants/enum.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function createDummyPost(source: Source, content: string) {
    return {
        publicationId: '',
        postId: '',
        author: createDummyProfile(),
        metadata: {
            locale: 'en',
            content: {
                content,
            },
        },
        source,
    } satisfies Post;
}
