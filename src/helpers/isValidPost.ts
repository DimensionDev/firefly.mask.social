import { getCurrentPostLimits } from '@/helpers/getCurrentPostLimits.js';
import { measureChars } from '@/helpers/readChars.js';
import type { CompositePost } from '@/store/useComposeStore.js';

/**
 * Detect if the post is valid to be published
 * @param post
 * @returns
 */
export function isValidPost({ availableSources, chars, images, video }: CompositePost) {
    if (!availableSources.length) return false;

    const { MAX_CHAR_SIZE_PER_POST } = getCurrentPostLimits(availableSources);
    const { length, visibleLength } = measureChars(chars);
    if (length > MAX_CHAR_SIZE_PER_POST) return false;
    if (!visibleLength && !images.length && !video) return false;
    return true;
}
