import { readChars } from '@/helpers/chars.js';
import type { CompositePost } from '@/store/useComposeStore.js';

/**
 * Detect if a post is empty
 * @param post
 * @returns
 */
export function isEmptyPost(post: CompositePost) {
    const content = readChars(post.chars, 'visible');
    return !content && !post.images.length && !post.video;
}
