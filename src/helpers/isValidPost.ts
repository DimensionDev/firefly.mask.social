import { measureChars } from '@/helpers/chars.js';
import { getCurrentPostLimits } from '@/helpers/getCurrentPostLimits.js';
import { isValidPoll } from '@/helpers/polls.js';
import type { CompositePost } from '@/store/useComposeStore.js';

/**
 * Detect if the post is valid to be published
 * @param post
 * @returns
 */
export function isValidPost(post: CompositePost) {
    if (!post.availableSources.length) return false;

    const { chars, images, video, availableSources, poll } = post;
    const { MAX_CHAR_SIZE_PER_POST } = getCurrentPostLimits(availableSources);
    const { length, visibleLength, invisibleLength } = measureChars(chars, availableSources, poll);
    if (length > MAX_CHAR_SIZE_PER_POST - invisibleLength) return false;
    if (!visibleLength && !images.length && !video) return false;
    if (poll && !isValidPoll(poll)) return false;
    return true;
}
