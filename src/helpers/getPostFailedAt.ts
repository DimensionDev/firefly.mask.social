import type { CompositePost } from '@/store/useComposeStore.js';

/**
 * Return a list of failed social platforms.
 * @param post
 * @returns
 */
export function getPostFailedAt(post: CompositePost) {
    return post.availableSources.filter((x) => !post.postId[x]);
}
