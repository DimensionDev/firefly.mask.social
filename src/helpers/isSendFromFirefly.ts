import type { Post } from '@/providers/types/SocialMedia.js';

export function isSendFromFirefly(post: Post) {
    const sendFrom = post.sendFrom?.displayName === 'Firefly App' ? 'Firefly' : post.sendFrom?.displayName;
    return typeof sendFrom === 'string' && sendFrom.toLowerCase() === 'firefly';
}
