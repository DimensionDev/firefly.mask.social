'use client';

import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation.js';
import { memo } from 'react';

import { FeedActionType } from '@/components/Posts/ActionType.js';
import { dynamic } from '@/esm/dynamic.js';
import { Link } from '@/esm/Link.js';
import { getPostPayload } from '@/helpers/getPostPayload.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
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
    isComment?: boolean;
    isDetail?: boolean;
}
export const SinglePost = memo<SinglePostProps>(function SinglePost({
    post,
    disableAnimate = false,
    showMore = false,
    isComment = false,
    isDetail = false,
}) {
    const router = useRouter();
    const { observe } = useObserveLensPost(post.postId, post.source);
    const postPayload = getPostPayload(post.metadata.content?.content);

    const pathname = usePathname();
    const isPostPage = pathname.includes('/post');
    const postLink = getPostUrl(post);

    return (
        <motion.article
            initial={!disableAnimate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cursor-pointer border-b border-secondaryLine bg-bottom px-4 py-3 hover:bg-bg dark:border-line"
            onClick={() => {
                if (!isPostPage && postPayload) {
                    router.push(postLink);
                }
            }}
        >
            {!isComment ? <FeedActionType post={post} /> : null}
            {!isPostPage || isComment ? (
                <Link href={postLink}>
                    <PostHeader post={post} />

                    <PostBody post={post} showMore={showMore} ref={observe} postPayload={postPayload} />

                    {!isDetail ? <PostActions post={post} disabled={post.isHidden} /> : null}
                </Link>
            ) : (
                <>
                    <PostHeader post={post} />

                    <PostBody post={post} showMore={showMore} ref={observe} postPayload={postPayload} />

                    {!isDetail ? <PostActions post={post} disabled={post.isHidden} /> : null}
                </>
            )}
        </motion.article>
    );
});
