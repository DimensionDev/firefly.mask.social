import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';

export function getCompositePost(id?: string) {
    const { posts, cursor } = useComposeStateStore.getState();
    const rootPost = posts[0];
    const post = posts.find((post) => post.id === (id ?? cursor));
    if (!post) return null;

    return {
        ...post,
        rootPost,
        isRootPost: rootPost === post,
        availableSources: rootPost.availableSources,
    } satisfies CompositePost & { rootPost: CompositePost; isRootPost: boolean };
}
