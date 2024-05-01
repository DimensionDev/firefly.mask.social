import type { CompositePost } from '@/store/useComposeStore.js';

/**
 * Return a list of failed social platforms.
 * @param post
 * @returns
 */
export function failedAt(post: CompositePost) {
    return post.availableSources.filter((x) => !post.postId[x]);
}

export function isPublishedPost(post: CompositePost) {
    return failedAt(post).length === 0;
}
