import type { SocialSource } from '@/constants/enum.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function createDummyPost(source: SocialSource, content: string) {
    return {
        publicationId: '',
        postId: '',
        author: createDummyProfile(source),
        metadata: {
            locale: 'en',
            content: {
                content,
            },
        },
        source,
    } satisfies Post;
}
