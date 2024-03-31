import { uniqBy } from 'lodash-es';

import { isSameProfile } from '@/helpers/isSameProfile.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function getFarcasterThreadsAndPosts(posts: Post[]) {
    const threadIds = new Set<string>();

    posts.forEach((post) => {
        if (
            !isSameProfile(post.author, post.commentOn?.author) ||
            !post.root?.postId ||
            threadIds.has(post.root?.postId)
        )
            return;
        if (post.root?.postId) {
            threadIds.add(post.root?.postId);
        }
    });

    const data = uniqBy(posts, (x) => {
        if (x.type !== 'Comment' && !threadIds.has(x.postId)) return x.postId;
        return x.root?.postId || x.postId;
    });

    return data;
}
