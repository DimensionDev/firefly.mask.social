import type { CompositePost } from '@/store/useComposeStore.js';

/**
 * Return a list of failed social platforms
 */
export function getThreadFailedAt(posts: CompositePost[]) {
    const rootPost = posts[0];
    return rootPost.availableSources.filter((x) => posts.some((y) => !y.postId[x]));
}
