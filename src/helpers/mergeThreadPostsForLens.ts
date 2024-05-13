import { uniqBy } from 'lodash-es';

import { isSameProfile } from '@/helpers/isSameProfile.js';
import { type Post } from '@/providers/types/SocialMedia.js';

export function mergeThreadPostsForLens(posts: Post[]) {
    const filtered = posts.filter((post, index, arr) => {
        if (post.type !== 'Comment') return true;

        if (
            !post.root &&
            isSameProfile(post.author, post.commentOn?.author) &&
            arr.some((x) => x.root?.postId === post.commentOn?.postId)
        )
            return false;

        return true;
    });

    return uniqBy(filtered, (x) => {
        if (x.type === 'Mirror') return `Mirror:${x.publicationId}`;
        if (x.type !== 'Comment' || !x.root) return x.publicationId;
        if (x.type === 'Comment' && x.firstComment?.postId !== x.postId) return x.publicationId;

        return x.root.publicationId;
    }).map((post) => {
        if (
            post.type === 'Comment' &&
            post.firstComment?.postId === post.postId &&
            isSameProfile(post.commentOn?.author, post.author) &&
            isSameProfile(post.root?.author, post.author)
        ) {
            return {
                ...post,
                isThread: true,
            };
        }

        return post;
    });
}
