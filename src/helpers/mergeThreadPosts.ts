import { safeUnreachable } from '@masknet/kit';

import { Source } from '@/constants/enum.js';
import { mergeThreadPostsForFarcaster } from '@/helpers/mergeThreadPostsForFarcaster.js';
import { mergeThreadPostsForLens } from '@/helpers/mergeThreadPostsForLens.js';
import type { Post } from '@/providers/types/SocialMedia.js';

/**
 * Merge related posts into threads if needed
 * @param source
 * @param posts
 * @returns
 */
export function mergeThreadPosts(source: Source, posts: Post[]): Post[] {
    switch (source) {
        case Source.Lens:
            return mergeThreadPostsForLens(posts);
        case Source.Farcaster:
            return mergeThreadPostsForFarcaster(posts);
        case Source.Twitter:
            return posts;
        case Source.Article:
            return posts;
        default:
            safeUnreachable(source);
            return posts;
    }
}
