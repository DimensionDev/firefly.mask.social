import type { SocialSource } from '@/constants/enum.js';
import { measureChars } from '@/helpers/chars.js';
import { isValidPoll } from '@/helpers/polls.js';
import type { CompositePost } from '@/store/useComposeStore.js';

/**
 * Detect if the post is valid to be published
 * @param post
 * @param verifiedSources
 * @returns
 */
export function isValidPost(post: CompositePost, verifiedSources?: { [key in SocialSource]?: boolean }) {
    if (!post.availableSources.length) return false;

    const { images, video, poll } = post;
    const { usedLength, availableLength } = measureChars(post, verifiedSources);
    if (usedLength > availableLength) return false;
    if (!usedLength && !images.length && !video) return false;
    if (poll && !isValidPoll(poll)) return false;
    return true;
}
