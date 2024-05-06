import { compact, first, last } from 'lodash-es';

import { MIN_POST_SIZE_PER_THREAD } from '@/constants/index.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function mergeThreadPostsForFarcaster(posts: Post[]) {
    const threadIds = compact(
        posts.map((x) =>
            x.threads?.length && x.threads.length >= MIN_POST_SIZE_PER_THREAD - 1 ? x.postId : undefined,
        ),
    );

    const data = posts.filter((x) => {
        if (x.type !== 'Comment') return true;
        if (
            (x.root?.postId && threadIds.includes(x.root.postId)) ||
            (x.commentOn?.postId && threadIds.includes(x.commentOn.postId))
        )
            return false;
        return true;
    });

    return data.map((x) => {
        // The data in the threads field of firefly will omit the root post.
        if (x.threads?.length && x.threads.length >= MIN_POST_SIZE_PER_THREAD - 1) {
            const current = x.threads.length === 2 ? last(x.threads) : first(x.threads);
            const parent = x.threads.length === 2 ? first(x.threads) : undefined;
            if (!current) return x;
            return {
                ...current,
                isThread: true,
                commentOn: parent,
                root: x,
            };
        }

        return x;
    });
}
