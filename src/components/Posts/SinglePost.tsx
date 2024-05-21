'use client';

import { Trans } from '@lingui/macro';
import { motion } from 'framer-motion';
import { isUndefined } from 'lodash-es';
import { usePathname, useRouter } from 'next/navigation.js';
import { memo, useMemo } from 'react';

import { FeedActionType } from '@/components/Posts/ActionType.js';
import { ChannelAnchor } from '@/components/Posts/ChannelAnchor.js';
import { PostBody } from '@/components/Posts/PostBody.js';
import { PostHeader } from '@/components/Posts/PostHeader.js';
import { Source } from '@/constants/enum.js';
import { dynamic } from '@/esm/dynamic.js';
import { classNames } from '@/helpers/classNames.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { type Post } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

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
    showTranslate?: boolean;
}
export const SinglePost = memo<SinglePostProps>(function SinglePost({
    post,
    disableAnimate = false,
    showMore = false,
    isComment = false,
    isDetail = false,
    showTranslate = false,
    listKey,
    index,
}) {
    const setScrollIndex = useGlobalState.use.setScrollIndex();
    const router = useRouter();

    const pathname = usePathname();

    const isPostPage = isRoutePathname(pathname, '/post/:detail', true);
    const isChannelPage = isRoutePathname(pathname, '/channel/:detail', true);
    const postLink = getPostUrl(post);

    const show = useMemo(() => {
        if (post.source === Source.Twitter) return false;
        if (!post.isThread || isPostPage) return false;

        if (post.source === Source.Farcaster && post.stats?.comments === 0) return false;
        return true;
    }, [post, isPostPage]);

    return (
        <motion.article
            initial={!disableAnimate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={classNames('border-b border-line bg-bottom px-3 py-2 hover:bg-bg md:px-4 md:py-3', {
                'cursor-pointer': post.source !== Source.Twitter,
            })}
            onClick={() => {
                if (post.source === Source.Twitter) return;
                const selection = window.getSelection();
                if (selection && selection.toString().length !== 0) return;
                if (!isPostPage || isComment) {
                    if (listKey && !isUndefined(index)) setScrollIndex(listKey, index);
                    router.push(postLink);
                }
                return;
            }}
        >
            {!isComment ? <FeedActionType post={post} listKey={listKey} index={index} /> : null}

            <PostHeader
                post={post}
                onClickProfileLink={() => {
                    if (listKey && !isUndefined(index)) setScrollIndex(listKey, index);
                }}
            />

            <PostBody post={post} showMore={showMore} showTranslate={showTranslate} />
            {!!post.channel && !isComment && !isChannelPage ? <ChannelAnchor channel={post.channel} /> : null}
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
