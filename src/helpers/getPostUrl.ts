import urlcat from 'urlcat';

import { PageRoute } from '@/constants/enum.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function getPostUrl(post: Post) {
    return urlcat(PageRoute.PostDetail, { source: post.source.toLowerCase(), id: post.postId });
}
