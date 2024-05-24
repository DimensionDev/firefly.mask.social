import type { Post } from '@/providers/types/SocialMedia.js';

export function isSamePost(post: Post | null | undefined, otherPost: Post | null | undefined) {
    if (!post || !otherPost) return false;
    return post.source === otherPost.source && post.postId === otherPost.postId;
}
