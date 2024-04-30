import type { CompositePost } from '@/store/useComposeStore.js';

export function isPublishedPost(post: CompositePost) {
    return post.availableSources.every((x) => !!post.postId[x]);
}
