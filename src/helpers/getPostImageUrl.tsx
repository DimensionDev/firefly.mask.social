import urlcat from 'urlcat';

import type { Post } from '@/providers/types/SocialMedia.js';

export function getPostImageUrl(post: Post, index: number, isPostPage?: boolean) {
    return urlcat('/post/:id/photos/:index', {
        source: post.source.toLowerCase(),
        id: post.postId,
        index,
        hiddenTabs: isPostPage ? isPostPage : undefined,
    });
}
