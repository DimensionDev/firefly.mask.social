import { safeUnreachable } from '@masknet/kit';

import { SocialPlatform } from '@/constants/enum.js';
import { mergeThreadPostsForFarcaster } from '@/helpers/mergeThreadPostsForFarcaster.js';
import { mergeThreadPostsForLens } from '@/helpers/mergeThreadPostsForLens.js';
import type { Post } from '@/providers/types/SocialMedia.js';

/**
 * Merge related posts into threads if needed
 * @param source
 * @param posts
 * @returns
 */
export function mergeThreadPosts(source: SocialPlatform, posts: Post[]): Post[] {
    switch (source) {
        case SocialPlatform.Lens:
            return mergeThreadPostsForLens(posts);
        case SocialPlatform.Farcaster:
            return mergeThreadPostsForFarcaster(posts);
        case SocialPlatform.Twitter:
            return posts;
        case SocialPlatform.Article:
            return posts;
        default:
            safeUnreachable(source);
            return posts;
    }
}
