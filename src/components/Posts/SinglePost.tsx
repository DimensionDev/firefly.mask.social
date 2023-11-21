'use client';

import urlcat from 'urlcat';
import { useRouter } from 'next/navigation.js';
import { memo } from 'react';
import { motion } from 'framer-motion';
import type { Post } from '@/providers/types/SocialMedia.js';
import { PostHeader } from './PostHeader.js';
import { PostBody } from './PostBody.js';

interface SinglePostProps {
    post: Post;
    showMore?: boolean;
}
export const SinglePost = memo<SinglePostProps>(function SinglePost({ post, showMore = false }) {
    const router = useRouter();
    return (
        <motion.article
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cursor-pointer border-b border-line bg-bottom px-4 py-3 hover:bg-bg"
            onClick={() => {
                router.push(urlcat('/detail/:platform/:id', { platform: post.source.toLowerCase(), id: post.postId }));
            }}
        >
            <PostHeader post={post} />
            <PostBody post={post} showMore={showMore} />
        </motion.article>
    );
});
