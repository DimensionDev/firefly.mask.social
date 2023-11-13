import { memo } from 'react';
import { motion } from 'framer-motion';
import { Post } from '@/providers/types/SocialMedia';
import { PostHeader } from '@/components/Posts/PostHeader';
import { PostBody } from '@/components/Posts/PostBody';

interface SinglePost {
    post: Post;
}
export const SinglePost = memo<SinglePost>(function SinglePost({ post }) {
    return (
        <motion.article
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cursor-pointer py-3 px-4"
        >
            <PostHeader post={post} />
            <PostBody post={post} />
        </motion.article>
    );
});
