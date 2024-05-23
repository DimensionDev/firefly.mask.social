import { compact, first, last } from 'lodash-es';

import { MIN_POST_SIZE_PER_THREAD } from '@/constants/index.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function mergeThreadPostsForFarcaster(posts: Post[]) {
    const threads = compact(
        posts.map((x) =>
            x.threads?.length && x.threads.length >= MIN_POST_SIZE_PER_THREAD - 1 && x.type !== 'Mirror'
                ? x
                : undefined,
        ),
    );

    const data = posts.filter((x) => {
        if (x.type !== 'Comment') return true;
        if (
            (x.root?.postId &&
                threads.some((thread) => thread.postId === x.root?.postId && isSameProfile(thread.author, x.author))) ||
            (x.commentOn?.postId &&
                threads.some(
                    (thread) => thread.postId === x.commentOn?.postId && isSameProfile(thread.author, x.author),
                ))
        )
            return false;

        return true;
    });

    return data.map((x) => {
        // The data in the threads field of firefly will omit the root post.
        if (x.threads?.length && x.threads.length >= MIN_POST_SIZE_PER_THREAD - 1 && x.type !== 'Mirror') {
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
