import { last } from 'lodash-es';
import urlcat from 'urlcat';

import { type SocialSource,Source } from '@/constants/enum.js';
import { EMPTY_LIST, MIN_POST_SIZE_PER_THREAD } from '@/constants/index.js';
import { isSamePost } from '@/helpers/isSamePost.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { createIndicator, createPageable } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';


function refreshThreadByPostId(postId: string) {
    return fetch(
        urlcat('/api/thread', {
            id: postId,
        }),
        {
            method: 'PUT',
        },
    );
}

export async function getThreads(post: Post, source: SocialSource) {
    const root = post.root ? post.root : post.commentOn ? post.commentOn : post;
    if (!root?.stats?.comments) return createPageable<Post>(EMPTY_LIST, createIndicator());

    if (!isSameProfile(root.author, post.author)) return createPageable<Post>(EMPTY_LIST, createIndicator());

    const provider = resolveSocialMediaProvider(source);
    const posts = await provider.getThreadByPostId(root.postId, isSamePost(root, post) ? post : undefined);

    /**
     * The data of Lens is stored in Redis.
     * Since there is no expiration time and we need to check each time whether a new post has been added to the thread.
     * If so, we need to clear the cache and request again.
     */
    if (source === Source.Lens && posts.length >= MIN_POST_SIZE_PER_THREAD) {
        const lastPost = last(posts);
        if (!lastPost) return createPageable(posts, undefined);

        const commentsOfLastPost = await LensSocialMediaProvider.getCommentsByProfileId(
            lastPost.postId,
            lastPost.author.profileId,
        );
        if (commentsOfLastPost.data.length === 0) return createPageable(posts, undefined);

        const response = await refreshThreadByPostId(root.postId);
        if (response.status !== 200) return createPageable(posts, undefined);
        return createPageable(await provider.getThreadByPostId(root.postId), undefined);
    }

    if (!posts.some((x) => isSamePost(x, post))) return createPageable(EMPTY_LIST, undefined);

    return createPageable(posts, undefined);
}
