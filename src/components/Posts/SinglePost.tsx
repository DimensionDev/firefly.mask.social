'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';

import { FeedActionType } from '@/components/Posts/ActionType.js';
import { dynamic } from '@/esm/dynamic.js';
import { useObserveLensPost } from '@/hooks/useObserveLensPost.js';
import type { Post } from '@/providers/types/SocialMedia.js';

import { PostBody } from './PostBody.js';
import { PostHeader } from './PostHeader.js';

const PostActions = dynamic(() => import('@/components/Actions/index.js').then((module) => module.PostActions), {
    ssr: false,
});

interface SinglePostProps {
    post: Post;
    disableAnimate?: boolean;
    showMore?: boolean;
}
export const SinglePost = memo<SinglePostProps>(function SinglePost({
    post,
    disableAnimate = false,
    showMore = false,
}) {
    const { observe } = useObserveLensPost(post.postId, post.source);
    return (
        <motion.article
            initial={!disableAnimate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="order-b border-secondaryLine bg-bottom px-4 py-3 hover:bg-bg"
        >
            <FeedActionType post={post} />
            <PostHeader post={post} />

            <PostBody post={post} showMore={showMore} ref={observe} />

            <PostActions post={post} disabled={post.isHidden} />
        </motion.article>
    );
});
