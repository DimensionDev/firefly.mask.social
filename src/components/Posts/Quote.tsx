'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation.js';
import { memo } from 'react';

import { PostBody } from '@/components/Posts/PostBody.js';
import { PostHeader } from '@/components/Posts/PostHeader.js';
import { classNames } from '@/helpers/classNames.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface QuoteProps {
    post: Post;
    className?: string;
}

export const Quote = memo<QuoteProps>(function Quote({ post, className = '' }) {
    const router = useRouter();
    return (
        <motion.article
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={classNames('mt-3 cursor-pointer rounded-2xl border border-secondaryLine bg-bg p-3', className)}
            onClick={(event) => {
                event.stopPropagation();

                const selection = window.getSelection();
                if (selection && selection.toString().length !== 0) return;
                router.push(getPostUrl(post));
            }}
        >
            <PostHeader post={post} isQuote />
            <PostBody post={post} isQuote disablePadding={post.isHidden || post.isEncrypted} />
        </motion.article>
    );
});
