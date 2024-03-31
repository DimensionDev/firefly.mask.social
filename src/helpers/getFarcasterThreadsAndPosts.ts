import { uniqBy } from 'lodash-es';

import { isSameProfile } from '@/helpers/isSameProfile.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export async function getFarcasterThreadsAndPosts(posts: Post[]) {
    const threadIds = new Set<string>();

    posts.forEach((post) => {
        if (
            !isSameProfile(post.author, post.commentOn?.author) ||
            !post.rootParentHash ||
            threadIds.has(post.rootParentHash)
        )
            return;
        if (post.rootParentHash) {
            threadIds.add(post.rootParentHash);
        }
    });

    const data = uniqBy(posts, (x) => {
        if (x.type !== 'Comment' && !threadIds.has(x.postId)) return x.postId;
        return x.rootParentHash || x.postId;
    });

    return Promise.all(
        data.map(async (x) => {
            if (!x.rootParentHash || !threadIds.has(x.rootParentHash)) return x;
            const rootPost = await FarcasterSocialMediaProvider.getPostById(x.rootParentHash);

            return {
                ...x,
                root: rootPost,
            };
        }),
    );
}
