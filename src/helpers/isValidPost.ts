import { measureChars } from '@/helpers/chars.js';
import { getCurrentPostLimits } from '@/helpers/getCurrentPostLimits.js';
import type { CompositePost } from '@/store/useComposeStore.js';

/**
 * Detect if the post is valid to be published
 * @param post
 * @returns
 */
export function isValidPost(post: CompositePost, rootPost: CompositePost) {
    const { availableSources } = rootPost;
    if (!availableSources.length) return false;

    const { chars, images, video } = post;
    const { MAX_CHAR_SIZE_PER_POST } = getCurrentPostLimits(availableSources);
    const { length, visibleLength } = measureChars(chars, availableSources);
    if (length > MAX_CHAR_SIZE_PER_POST) return false;
    if (!visibleLength && !images.length && !video) return false;
    return true;
}
