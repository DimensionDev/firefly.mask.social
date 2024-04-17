import urlcat from 'urlcat';

import type { Post } from '@/providers/types/SocialMedia.js';

export function getPostImageUrl(post: Post, index: number) {
    return urlcat('/post/:id/photos/:index', { source: post.source.toLowerCase(), id: post.postId, index });
}
