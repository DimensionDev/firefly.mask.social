import { readChars } from '@/helpers/readChars.js';
import type { CompositePost } from '@/store/useComposeStore.js';

/**
 * Detect if a post is empty
 * @param post 
 * @returns 
 */
export function isEmptyPost(post: CompositePost) {
    const content = readChars(post.chars, true);
    return !content && !post.images.length && !post.video;
}
