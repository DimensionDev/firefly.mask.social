import { safeUnreachable } from '@masknet/kit';

import { SocialPlatform } from '@/constants/enum.js';
import { MAX_THREAD_SIZE } from '@/constants/index.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export async function getThreadById(source: SocialPlatform, post: Post, maxDepth = MAX_THREAD_SIZE): Promise<Post[]> {
    const result: Post[] = [];

    switch (source) {
        case SocialPlatform.Lens:
            const data = await LensSocialMediaProvider.getThreadsById(post, maxDepth);
            return [post, ...data];
        case SocialPlatform.Farcaster:
            return result;
        default:
            safeUnreachable(source);
            return result;
    }
}
