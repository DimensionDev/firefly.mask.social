import type { CompositePost } from '@/store/useComposeStore.js';

/**
 * Return a list of failed social platforms
 */
export function failedAt(posts: CompositePost[]) {
    const rootPost = posts[0];
    return rootPost.availableSources.filter((x) => posts.some((y) => !y.postId[x]));
}

export function isPublishedPost(posts: CompositePost[]) {
    return failedAt(posts).length === 0;
}
