import { t } from '@lingui/macro';
import { first } from 'lodash-es';

import { SocialPlatform } from '@/constants/enum.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { crossPost } from '@/services/crossPost.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';

function shouldCrossPost(index: number, post: CompositePost, rootPost: CompositePost, posts: CompositePost[]) {
    // the root post defines the available sources for the thread
    const { availableSources } = rootPost;

    if (availableSources.includes(SocialPlatform.Lens) && !post.parentPost.Lens) return true;
    if (availableSources.includes(SocialPlatform.Farcaster) && !post.parentPost.Farcaster) return true;

    return false;
}

async function recompositePost(index: number, post: CompositePost, rootPost: CompositePost, posts: CompositePost[]) {
    if (index === 0) return post;

    // the root post defines the available sources for the thread
    const { availableSources } = rootPost;

    // reply to the previous published post in thread
    const previousPost = posts[index - 1];

    const promises: Array<Promise<Post | null>> = [];

    if (availableSources.includes(SocialPlatform.Lens)) {
        const parentPostId = previousPost.postId[SocialPlatform.Lens];
        if (!parentPostId) throw new Error(t`The previous post does not have a Lens post ID.`);
        promises.push(LensSocialMediaProvider.getPostById(parentPostId));
    } else {
        promises.push(Promise.resolve(null));
    }

    if (availableSources.includes(SocialPlatform.Farcaster)) {
        const parentPostId = previousPost.postId[SocialPlatform.Farcaster];
        if (!parentPostId) throw new Error(t`The previous post does not have a Farcaster post ID.`);
        promises.push(FarcasterSocialMediaProvider.getPostById(parentPostId));
    } else {
        promises.push(Promise.resolve(null));
    }

    const [lensPost, farcasterPost] = await Promise.all(promises);

    return {
        ...post,
        parentPost: {
            [SocialPlatform.Lens]: lensPost,
            [SocialPlatform.Farcaster]: farcasterPost,
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
