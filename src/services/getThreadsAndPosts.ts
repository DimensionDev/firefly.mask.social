import { safeUnreachable } from '@masknet/kit';

import { SocialPlatform } from '@/constants/enum.js';
import { getFarcasterThreadsAndPosts } from '@/helpers/getFarcasterThreadsAndPosts.js';
import { getLensThreadsAndPosts } from '@/helpers/getLensThreadsAndPosts.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function getThreadsAndPosts(source: SocialPlatform, post: Post[]) {
    switch (source) {
        case SocialPlatform.Lens:
            return getLensThreadsAndPosts(post);
        case SocialPlatform.Farcaster:
            return getFarcasterThreadsAndPosts(post);
        default:
            safeUnreachable(source);
            return post;
    }
}
