import { safeUnreachable } from '@masknet/kit';

import { SocialPlatform } from '@/constants/enum.js';
import { mergeTreadPostsForFarcaster } from '@/helpers/mergeTreadPostsForFarcaster.js';
import { mergeTreadPostsForLens } from '@/helpers/mergeTreadPostsForLens.js';
import type { Post } from '@/providers/types/SocialMedia.js';

/**
 * Merge related posts into threads if needed
 * @param source
 * @param post
 * @returns
 */
export function mergeTreadPosts(source: SocialPlatform, post: Post[]) {
    switch (source) {
        case SocialPlatform.Lens:
            return mergeTreadPostsForLens(post);
        case SocialPlatform.Farcaster:
            return mergeTreadPostsForFarcaster(post);
        default:
            safeUnreachable(source);
            return post;
    }
}
