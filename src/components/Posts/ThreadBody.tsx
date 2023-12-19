import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation.js';
import { memo } from 'react';

import { PostActions } from '@/components/Actions/index.js';
import { FeedActionType } from '@/components/Posts/ActionType.js';
import { PostBody } from '@/components/Posts/PostBody.js';
import { PostHeader } from '@/components/Posts/PostHeader.js';
import { Link } from '@/esm/Link.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useObserveLensPost } from '@/hooks/useObserveLensPost.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface ThreadBodyProps {
    post: Post;
    disableAnimate?: boolean;
}

export const ThreadBody = memo<ThreadBodyProps>(function ThreadBody({ post, disableAnimate }) {
    const router = useRouter();
    const { observe } = useObserveLensPost(post.postId, post.source);

    const pathname = usePathname();
    const isPostPage = isRoutePathname(pathname, '/post');

    const link = getPostUrl(post);

    return (
        <motion.article
            initial={!disableAnimate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cursor-pointer bg-bottom"
        >
            <span ref={observe} />
            <FeedActionType post={post} isThread />
            {isPostPage ? (
                <div
                    onClick={(event) => {
                        if (!isPostPage) {
                            event.preventDefault();
                            event.stopPropagation();
                            router.push(link);
                        }
                    }}
                >
                    <PostHeader post={post} />
                    <div className="flex">
                        <div className="-my-6 ml-5 mr-8 border-[0.8px] border-gray-300 bg-gray-300 dark:border-gray-700 dark:bg-gray-700" />
                        <div className="w-full max-w-[calc(100%_-_53px)] pb-5">
                            <PostBody post={post} disablePadding />
                            <PostActions post={post} disabled={post.isHidden} disablePadding />
                        </div>
                    </div>
                </div>
            ) : (
                <Link href={link}>
                    <PostHeader post={post} />
                    <div className="flex">
                        <div className="-my-6 ml-5 mr-8 border-[0.8px] border-gray-300 bg-gray-300 dark:border-gray-700 dark:bg-gray-700" />
                        <div className="w-full max-w-[calc(100%_-_53px)] pb-5">
                            <PostBody post={post} disablePadding />
                            <PostActions post={post} disabled={post.isHidden} disablePadding />
                        </div>
                    </div>
                </Link>
            )}
        </motion.article>
    );
});
