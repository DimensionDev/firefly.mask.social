'use client';

import urlcat from 'urlcat';
import { useRouter } from 'next/navigation.js';
import { memo } from 'react';
import { motion } from 'framer-motion';
import { PostHeader } from '@/components/Posts/PostHeader.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { PostBody } from '@/components/Posts/PostBody.js';

interface QuoteProps {
    post: Post;
}

export const Quote = memo<QuoteProps>(function Quote({ post }) {
    const router = useRouter();
    return (
        <motion.article
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 cursor-pointer rounded-2xl border border-solid border-third bg-primaryBottom  px-4 py-3 hover:bg-bg dark:bg-secondaryBottom"
            onClick={() => {
                router.push(urlcat('/detail/:platform/:id', { platform: post.source, id: post.postId }));
            }}
        >
            <PostHeader post={post} isQuote />
            <PostBody post={post} isQuote />
        </motion.article>
    );
});
