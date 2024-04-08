import type { CompositePost } from '@/store/useComposeStore.js';

export function isPublishedPost(compositePost: CompositePost) {
    return compositePost.availableSources.every((x) => !!compositePost.postId[x]);
}
