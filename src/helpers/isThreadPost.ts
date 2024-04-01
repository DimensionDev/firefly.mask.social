import { safeUnreachable } from '@masknet/kit';

import { SocialPlatform } from '@/constants/enum.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function isThreadPost(post: Post) {
    switch (post.source) {
        case SocialPlatform.Lens:
            return (
                post.type === 'Comment' &&
                post.firstComment?.postId === post.postId &&
                isSameProfile(post.root?.author, post.author)
            );
        case SocialPlatform.Farcaster:
            return (
                post.type === 'Comment' &&
                isSameProfile(post.commentOn?.author, post.author) &&
                isSameProfile(post.root?.author, post.author)
            );
        case SocialPlatform.Twitter:
            return false;
        default:
            safeUnreachable(post.source);
            return false;
    }
}
