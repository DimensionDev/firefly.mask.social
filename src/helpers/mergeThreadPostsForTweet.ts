import { uniqBy } from 'lodash-es';

import { isSameProfile } from '@/helpers/isSameProfile.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function mergeThreadPostsFOrTweet(posts: Post[]) {
    const record = new Set();
    const filtered = posts.filter((post) => {
        if (post.type !== 'Comment') return true;
        if (record.has(post.postId) || record.has(post.commentOn?.postId) || record.has(post.postId)) return false;

        if (
            post.root &&
            isSameProfile(post.commentOn?.author, post.author) &&
            isSameProfile(post.author, post.root.author) &&
            !record.has(post.root.postId)
        ) {
            record.add(post.root.postId);
            return true;
        }

        return true;
    });

    return uniqBy(filtered, (x) => {
        if (x.type === 'Mirror') return `Mirror:${x.publicationId}`;
        if (x.type !== 'Comment' || !x.root) return x.publicationId;

        return x.root.publicationId;
    }).map((post) => {
        if (record.has(post.root?.postId))
            return {
                ...post,
                isThread: true,
            };

        return post;
    });
}
