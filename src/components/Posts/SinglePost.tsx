'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation.js';
import { memo } from 'react';
import { useInView } from 'react-cool-inview';

import { SocialPlatform } from '@/constants/enum.js';
import { dynamic } from '@/esm/dynamic.js';
import { Link } from '@/esm/Link.js';
import { addPostViews } from '@/helpers/addPostViews.js';
import { getPostDetailUrl } from '@/helpers/getPostDetailUrl.js';
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
    const router = useRouter();

    const { observe } = useInView({
        onChange: async ({ inView }) => {
            if (!inView || post.source !== SocialPlatform.Lens) return;
            addPostViews(post.postId);
        },
    });
    return (
        <motion.article
            initial={!disableAnimate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cursor-pointer border-b border-secondaryLine bg-bottom px-4 py-3 hover:bg-bg"
        >
            <Link href={getPostDetailUrl(post.postId, post.source)}>
                <PostHeader post={post} />

                <PostBody post={post} showMore={showMore} ref={observe} />

                <PostActions post={post} disabled={post.isHidden} />
            </Link>
        </motion.article>
    );
});
