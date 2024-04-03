import { t } from '@lingui/macro';

import type { SocialPlatform } from '@/constants/enum.js';
import { SORTED_SOURCES } from '@/constants/index.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { crossPost } from '@/services/crossPost.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';

function shouldCrossPost(index: number, post: CompositePost, rootPost: CompositePost, posts: CompositePost[]) {
    // the root post defines the available sources for the thread
    const { availableSources } = rootPost;

    return SORTED_SOURCES.some((x) => availableSources.includes(x) && !post.parentPost[x]);
}

async function recompositePost(index: number, post: CompositePost, rootPost: CompositePost, posts: CompositePost[]) {
    if (index === 0) return post;

    const { availableSources } = rootPost;

    // reply to the previous published post in thread
    const previousPost = posts[index - 1];

    const all: Array<Promise<Post | null>> = [];

    SORTED_SOURCES.forEach((x) => {
        const parentPostId = previousPost.postId[x];
        const provider = resolveSocialMediaProvider(x);

        if (availableSources.includes(x) && parentPostId && !post.parentPost[x] && provider) {
            all.push(provider.getPostById(parentPostId));
        } else {
            all.push(Promise.resolve(null));
        }
    });

    const allSettled = await Promise.allSettled(all);

    return {
        ...post,
        parentPost: Object.fromEntries(
            SORTED_SOURCES.map((x, i) => {
                const settled = allSettled[i];
                const fetchedPost = settled.status === 'fulfilled' ? settled.value : null;
                return [x, post.parentPost[x] ?? fetchedPost];
            }),
        ) as Record<SocialPlatform, Post | null>,

        // override the available sources with the root post's
        availableSources,
    } satisfies CompositePost;
}

export async function crossPostThread() {
    const { posts } = useComposeStateStore.getState();
    if (posts.length === 1) throw new Error(t`A thread must have at least two posts.`);

    for (const [index, _] of posts.entries()) {
        const { posts: allPosts } = useComposeStateStore.getState();

        // skip post when recover from error
        if (!shouldCrossPost(index, _, allPosts[0], allPosts)) return;

        // reply to the previous published post in thread
        const post = await recompositePost(index, _, allPosts[0], allPosts);
        await crossPost(index === 0 ? 'compose' : 'reply', post, {
            skipIfNoParentPost: true,
        });
    }
}
