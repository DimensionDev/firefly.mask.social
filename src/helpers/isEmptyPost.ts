import { readChars } from '@/helpers/readChars.js';
import type { CompositePost } from '@/store/useComposeStore.js';

export function isEmptyPost(post: CompositePost) {
    const content = readChars(post.chars, true);
    return !content && !post.images.length && !post.video;
}
