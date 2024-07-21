import { compact, first, last, uniqBy } from 'lodash-es';

import { type SocialSource, Source } from '@/constants/enum.js';
import { MIN_POST_SIZE_PER_THREAD } from '@/constants/index.js';
import { safeUnreachable } from '@/helpers/controlFlow.js';
import { isSamePost } from '@/helpers/isSamePost.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import type { Post } from '@/providers/types/SocialMedia.js';

function mergeThreadPostsFOrTweet(posts: Post[]) {
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

function mergeThreadPostsForLens(posts: Post[]) {
    const filtered = posts.filter((post, index, arr) => {
        if (post.type !== 'Comment') return true;

        if (
            !post.root &&
            isSameProfile(post.author, post.commentOn?.author) &&
            arr.some((x) => isSamePost(x.root, post.commentOn))
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
            isSamePost(post.firstComment, post) &&
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

function mergeThreadPostsForFarcaster(posts: Post[]) {
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
                threads.some((thread) => isSamePost(thread, x.root) && isSameProfile(thread.author, x.author))) ||
            (x.commentOn?.postId &&
                threads.some((thread) => isSamePost(thread, x.commentOn) && isSameProfile(thread.author, x.author)))
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
