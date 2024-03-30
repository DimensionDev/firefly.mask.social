import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation.js';
import { memo } from 'react';
import { useInView } from 'react-cool-inview';

import { PostActions } from '@/components/Actions/index.js';
import { FeedActionType } from '@/components/Posts/ActionType.js';
import { PostBody } from '@/components/Posts/PostBody.js';
import { PostHeader } from '@/components/Posts/PostHeader.js';
import { classNames } from '@/helpers/classNames.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useObserveLensPost } from '@/hooks/useObserveLensPost.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface ThreadBodyProps {
    post: Post;
    disableAnimate?: boolean;
    isLast?: boolean;
}

export const ThreadBody = memo<ThreadBodyProps>(function ThreadBody({ post, disableAnimate, isLast }) {
    const router = useRouter();
    const { observe } = useObserveLensPost(post.postId, post.source);

    const pathname = usePathname();
    const isPostPage = isRoutePathname(pathname, '/post');

    const link = getPostUrl(post);

    const { observe: observeRef } = useInView({
        rootMargin: '300px 0px',
        onChange: async ({ inView }) => {
            if (!inView || isPostPage) {
                return;
            }
            router.prefetch(link);
        },
    });

    return (
        <motion.article
            ref={observeRef}
            initial={!disableAnimate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cursor-pointer bg-bottom"
            onClick={() => {
                const selection = window.getSelection();
                if (selection && selection.toString().length !== 0) return;
                if (!isPostPage) router.push(link);
            }}
        >
            <span ref={observe} />
            <FeedActionType post={post} isThread />
            <PostHeader post={post} />
            <div className="flex">
                <div
                    className={classNames('ml-5 mr-8 border-[0.8px] ', {
                        'border-transparent bg-transparent dark:border-transparent dark:bg-none': !!isLast,
                        'border-gray-300 bg-gray-300 dark:border-gray-700 dark:bg-gray-700': !isLast,
                    })}
                />

                <div className={'w-full max-w-[calc(100%_-_53px)] pb-5'}>
                    <PostBody post={post} disablePadding />
                    <PostActions post={post} disabled={post.isHidden} disablePadding />
                </div>
            </div>
        </motion.article>
    );
});
