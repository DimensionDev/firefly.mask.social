'use client';

import { Trans } from '@lingui/macro';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation.js';
import { memo, useMemo } from 'react';

import { FeedActionType } from '@/components/Posts/ActionType.js';
import { PostBody } from '@/components/Posts/PostBody.js';
import { PostHeader } from '@/components/Posts/PostHeader.js';
import { SocialPlatform } from '@/constants/enum.js';
import { dynamic } from '@/esm/dynamic.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { isNumber, isUndefined } from 'lodash-es';

const PostActions = dynamic(() => import('@/components/Actions/index.js').then((module) => module.PostActions), {
    ssr: false,
});

export interface SinglePostProps {
    post: Post;
    disableAnimate?: boolean;
    showMore?: boolean;
    isComment?: boolean;
    isDetail?: boolean;
    listKey?: string;
    index?: number;
}
export const SinglePost = memo<SinglePostProps>(function SinglePost({
    post,
    disableAnimate = false,
    showMore = false,
    isComment = false,
    isDetail = false,
    listKey,
    index,
}) {
    const setScrollIndex = useGlobalState.use.setScrollIndex();
    const router = useRouter();

    const pathname = usePathname();

    const isPostPage = isRoutePathname(pathname, '/post/:detail', true);

    const postLink = getPostUrl(post);

    const show = useMemo(() => {
        if (!post.isThread || isPostPage) return false;

        if (post.source === SocialPlatform.Farcaster && post.stats?.comments === 0) return false;
        return true;
    }, [post, isPostPage]);

    return (
        <motion.article
            initial={!disableAnimate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cursor-pointer border-b border-line bg-bottom px-3 py-2 hover:bg-bg md:px-4 md:py-3"
            onClick={() => {
                const selection = window.getSelection();
                if (selection && selection.toString().length !== 0) return;
                if (!isPostPage || isComment) {
                    if (listKey && !isUndefined(index)) setScrollIndex(listKey, index);
                    router.push(postLink);
                }
                return;
            }}
        >
            {!isComment ? <FeedActionType post={post} /> : null}

            <PostHeader post={post} />

            <PostBody post={post} showMore={showMore} />

            {!isDetail ? <PostActions post={post} disabled={post.isHidden} /> : null}

            {show ? (
                <div className="mt-2 w-full cursor-pointer text-center text-[15px] font-bold text-link">
                    <div>
                        <Trans>Show More</Trans>
                    </div>
                </div>
            ) : null}
        </motion.article>
    );
});
