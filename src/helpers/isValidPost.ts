import { MAX_CHAR_SIZE_PER_POST } from '@/constants/index.js';
import { measureChars } from '@/helpers/readChars.js';
import type { CompositePost } from '@/store/useComposeStore.js';

/**
 * Detect if the post is valid to be published
 * @param post
 * @returns
 */
export function isValidPost({ availableSources, chars, images, video }: CompositePost) {
    if (!availableSources.length) return false;

    const { length, visibleLength } = measureChars(chars);
    if ((!visibleLength || length > MAX_CHAR_SIZE_PER_POST) && !images.length && !video) return false;
    return true;
}
