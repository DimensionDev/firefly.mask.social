import { measureChars } from '@/helpers/chars.js';
import { isValidPoll } from '@/helpers/polls.js';
import type { CompositePost } from '@/store/useComposeStore.js';

/**
 * Detect if the post is valid to be published
 * @param post
 * @returns
 */
export function isValidPost(post: CompositePost) {
    if (!post.availableSources.length) return false;

    const { images, video, poll } = post;
    const { usedLength, availableLength } = measureChars(post);
    if (usedLength > availableLength) return false;
    if (!usedLength && !images.length && !video) return false;
    if (poll && !isValidPoll(poll)) return false;
    return true;
}
