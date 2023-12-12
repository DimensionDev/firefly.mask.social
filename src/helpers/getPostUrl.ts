import urlcat from 'urlcat';

import type { Post } from '@/providers/types/SocialMedia.js';

export function getPostUrl(post: Post) {
    return urlcat(`/post/:platform/:id`, { platform: post.source.toLowerCase(), id: post.postId });
}
