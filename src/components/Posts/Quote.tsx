import { memo } from 'react';
import { motion } from 'framer-motion';
import { PostHeader } from '@/components/Posts/PostHeader.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { PostBody } from '@/components/Posts/PostBody.js';

interface QuoteProps {
    post: Post;
}

export const Quote = memo<QuoteProps>(function Quote({ post }) {
    return (
        <div className="border-third bg-primaryBottom mt-3 cursor-auto rounded-2xl border border-solid dark:bg-secondaryBottom">
            <motion.article
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="cursor-pointer px-4 py-3"
            >
                <PostHeader post={post} />
                <PostBody post={post} isQuote />
            </motion.article>
        </div>
    );
});
