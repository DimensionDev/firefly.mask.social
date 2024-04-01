import { t } from '@lingui/macro';
import { first } from 'lodash-es';

import { SocialPlatform } from '@/constants/enum.js';
import { SORTED_SOURCES } from '@/constants/index.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
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

    // the root post defines the available sources for the thread
    const { availableSources } = rootPost;

    // reply to the previous published post in thread
    const previousPost = posts[index - 1];

    const all: Array<Promise<Post | null>> = [];

    SORTED_SOURCES.forEach((source) => {
        const parentPostId = previousPost.postId[source];

        if (availableSources.includes(source) && parentPostId && !post.parentPost[source]) {
            all.push(FarcasterSocialMediaProvider.getPostById(parentPostId));
        } else {
            all.push(Promise.resolve(null));
        }
    });

    const allSettled = await Promise.allSettled(all);
    const [farcasterPost, lensPost, twitterPost] = allSettled.map((x) => (x.status === 'fulfilled' ? x.value : null));

    return {
        ...post,
        parentPost: {
            [SocialPlatform.Farcaster]: post.parentPost[SocialPlatform.Farcaster] ?? farcasterPost,
            [SocialPlatform.Lens]: post.parentPost[SocialPlatform.Lens] ?? lensPost,
            [SocialPlatform.Twitter]: post.parentPost[SocialPlatform.Twitter] ?? twitterPost,
        },
        // override the available sources with the root post's
        availableSources,
    } satisfies CompositePost;
}

export async function crossPostThread() {
    const { posts } = useComposeStateStore.getState();
    if (posts.length === 1) throw new Error(t`A thread must have at least two posts.`);

    for (const [index, _] of posts.entries()) {
        const { posts: allPosts } = useComposeStateStore.getState();

        const rootPost = first(allPosts);
        if (!rootPost) throw new Error(t`The root post not found.`);

        // skip post when recover from error
        if (!shouldCrossPost(index, _, rootPost, allPosts)) return;

        // reply to the previous published post in thread
        const post = await recompositePost(index, _, rootPost, allPosts);
        if (index === 0) await crossPost('compose', post);
        else await crossPost('reply', post);
    }
}
