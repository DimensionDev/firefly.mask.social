import type { SocialPlatform } from '@/constants/enum.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';

export function createDummyPost(source: SocialPlatform, content: string) {
    return {
        postId: '',
        author: createDummyProfile(),
        metadata: {
            locale: 'en',
            content: {
                content,
            },
        },
        source,
    };
}
