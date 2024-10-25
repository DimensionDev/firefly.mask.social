'use client';

import { useEffect } from 'react';

import { useUpdateCurrentVisitingPost } from '@/hooks/useCurrentVisitingPost.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface PostDetailEffectProps {
    post: Post;
}

/**
 * It is only for use in the server component, please do not use it in any post item.
 * @param postId
 * @returns
 */
export function PostDetailEffect({ post }: PostDetailEffectProps) {
    useUpdateCurrentVisitingPost(post);

    useEffect(() => {
        useImpressionsStore.getState().fetchAndStoreViews([post.postId]);
    }, [post.postId]);

    return null;
}
