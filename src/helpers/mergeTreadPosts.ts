import { safeUnreachable } from '@masknet/kit';

import { SocialPlatform } from '@/constants/enum.js';
import { mergeTreadPostsForFarcaster } from '@/helpers/mergeTreadPostsForFarcaster.js';
import { mergeTreadPostsForLens } from '@/helpers/mergeTreadPostsForLens.js';
import type { Post } from '@/providers/types/SocialMedia.js';

/**
 * Merge related posts into threads if needed
 * @param source
 * @param posts
 * @returns
 */
export function mergeTreadPosts(source: SocialPlatform, posts: Post[]) {
    switch (source) {
        case SocialPlatform.Lens:
            return mergeTreadPostsForLens(posts);
        case SocialPlatform.Farcaster:
            return mergeTreadPostsForFarcaster(posts);
        case SocialPlatform.Twitter:
            return posts;
        default:
            safeUnreachable(source);
            return posts;
    }
}
