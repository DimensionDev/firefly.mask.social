import urlcat from 'urlcat';

import type { Post } from '@/providers/types/SocialMedia.js';

export function getPostUrl(post: Post) {
    return urlcat('/post/:source/:id', { source: post.source.toLowerCase(), id: post.postId });
}
