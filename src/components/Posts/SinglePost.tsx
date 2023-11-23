'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation.js';
import { memo } from 'react';
import { useInView } from 'react-cool-inview';

import { PostActions } from '@/components/Actions/index.js';
import { SocialPlatform } from '@/constants/enum.js';
import { addPostViews } from '@/helpers/addPostViews.js';
import { getPostDetailUrl } from '@/helpers/getPostDetailUrl.js';
import type { Post } from '@/providers/types/SocialMedia.js';

import { PostBody } from './PostBody.js';
import { PostHeader } from './PostHeader.js';

interface SinglePostProps {
    post: Post;
    showMore?: boolean;
}
export const SinglePost = memo<SinglePostProps>(function SinglePost({ post, showMore = false }) {
    const router = useRouter();

    const { observe } = useInView({
        onChange: async ({ inView }) => {
            if (!inView || post.source !== SocialPlatform.Lens) return;
            addPostViews(post.postId);
        },
    });
    return (
        <motion.article
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cursor-pointer border-b border-line bg-bottom px-4 py-3 hover:bg-bg"
            onClick={() => {
                router.push(getPostDetailUrl(post.postId, post.source));
            }}
        >
            <PostHeader post={post} />

            <PostBody post={post} showMore={showMore} ref={observe} />

            <PostActions post={post} disabled={post.isHidden} />
        </motion.article>
    );
});
