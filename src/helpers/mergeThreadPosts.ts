import { safeUnreachable } from '@masknet/kit';

import { type SocialSource, Source } from '@/constants/enum.js';
import { mergeThreadPostsForFarcaster } from '@/helpers/mergeThreadPostsForFarcaster.js';
import { mergeThreadPostsForLens } from '@/helpers/mergeThreadPostsForLens.js';
import { mergeThreadPostsFOrTweet } from '@/helpers/mergeThreadPostsForTweet.js';
import type { Post } from '@/providers/types/SocialMedia.js';

/**
 * Merge related posts into threads if needed
 * @param source
 * @param posts
 * @returns
 */
export function mergeThreadPosts(source: SocialSource, posts: Post[]): Post[] {
    switch (source) {
        case Source.Lens:
            return mergeThreadPostsForLens(posts);
        case Source.Farcaster:
            return mergeThreadPostsForFarcaster(posts);
        case Source.Twitter:
            return mergeThreadPostsFOrTweet(posts);
        default:
            safeUnreachable(source);
            return posts;
    }
}
