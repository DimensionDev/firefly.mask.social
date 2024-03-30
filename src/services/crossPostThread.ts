import { t } from '@lingui/macro';
import { first } from 'lodash-es';

import { crossPost } from '@/services/crossPost.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';

function shouldCrossPost(index: number, post: CompositePost, rootPost: CompositePost, posts: CompositePost[]) {
    // the root post define the available sources for the thread
    const { availableSources } = rootPost;

    return true;
}

function recompositePost(index: number, post: CompositePost, rootPost: CompositePost, posts: CompositePost[]) {
    return post;
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
        const post = recompositePost(index, _, rootPost, allPosts);
        if (index === 0) await crossPost('compose', post);
        else await crossPost('reply', post);
    }
}
