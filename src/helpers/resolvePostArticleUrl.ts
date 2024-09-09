import { safeUnreachable } from '@masknet/kit';

import { Source } from '@/constants/enum.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function resolvePostArticleUrl(post: Post) {
    switch (post.source) {
        case Source.Twitter:
            return `https://x.com/${post.author.handle}/status/${post.postId}`;
        case Source.Farcaster:
            return '';
        case Source.Lens:
            return '';
        default:
            safeUnreachable(post.source);
            return '';
    }
}
