'use client';

import { Trans } from '@lingui/macro';
import { motion } from 'framer-motion';
import { isUndefined } from 'lodash-es';
import { usePathname, useRouter } from 'next/navigation.js';
import { type HTMLProps, memo, useMemo } from 'react';

import { PostActions } from '@/components/Actions/index.js';
import { NoSSR } from '@/components/NoSSR.js';
import { FeedActionType } from '@/components/Posts/ActionType.js';
import { PostBody } from '@/components/Posts/PostBody.js';
import { PostHeader } from '@/components/Posts/PostHeader.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useIsProfileMuted } from '@/hooks/useIsProfileMuted.js';
import { type Post } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export interface SinglePostProps extends HTMLProps<HTMLDivElement> {
    post: Post;
    disableAnimate?: boolean;
    showMore?: boolean;
    isComment?: boolean;
    isDetail?: boolean;
    listKey?: string;
    index?: number;
    showTranslate?: boolean;
    showChannelTag?: boolean;
}
export const SinglePost = memo<SinglePostProps>(function SinglePost({
    post,
    disableAnimate = false,
    showMore = false,
    isComment = false,
    isDetail = false,
    showTranslate = false,
    showChannelTag = true,
    listKey,
    index,
    className,
}) {
    const router = useRouter();
    const pathname = usePathname();
    const isPostPage = isRoutePathname(pathname, '/post/:source');
    const isProfilePage = isRoutePathname(pathname, '/profile/:source');
    const isChannelPage = isRoutePathname(pathname, '/channel/:detail');
    const postLink = getPostUrl(post);
    const muted = useIsProfileMuted(post.author);

    const show = useMemo(() => {
        if (post.source === Source.Twitter) return false;
        if (!post.isThread || isPostPage) return false;
        if (post.source === Source.Farcaster && post.stats?.comments === 0) return false;
        return true;
    }, [post, isPostPage]);

    if (!isProfilePage && !isDetail && muted) return null;

    const showPostAction = !isDetail && (isProfilePage || !post.isHidden || !muted);

    return (
        <motion.article
            initial={!disableAnimate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={classNames(
                'cursor-pointer border-b border-line bg-bottom px-3 py-2 md:px-4 md:py-3',
                className,
                {
                    'hover:bg-bg': !isDetail,
                },
            )}
            onClick={() => {
                const selection = window.getSelection();
                if (selection && selection.toString().length !== 0) return;
                if (!isPostPage || isComment) {
                    if (listKey && !isUndefined(index)) useGlobalState.getState().setScrollIndex(listKey, index);
                    router.push(postLink);
                }
                return;
            }}
        >
            <NoSSR>
                {!isComment ? <FeedActionType isDetail={isDetail} post={post} listKey={listKey} index={index} /> : null}
            </NoSSR>

            <PostHeader
                isComment={isComment}
                post={post}
                onClickProfileLink={() => {
                    if (listKey && !isUndefined(index)) useGlobalState.getState().setScrollIndex(listKey, index);
                }}
            />

            <PostBody
                post={post}
                showMore={showMore}
                showTranslate={showTranslate}
                isDetail={isDetail}
                isComment={isComment}
            />
            <NoSSR>
                {showPostAction ? (
                    <PostActions
                        post={post}
                        disabled={post.isHidden}
                        showChannelTag={!isComment && !isChannelPage && showChannelTag}
                        onSetScrollIndex={() => {
                            if (listKey && !isUndefined(index))
                                useGlobalState.getState().setScrollIndex(listKey, index);
                        }}
                    />
                ) : null}
            </NoSSR>

            {show ? (
                <div className="mt-2 w-full cursor-pointer text-center text-medium font-bold text-highlight">
                    <div>
                        <Trans>Show More</Trans>
                    </div>
                </div>
            ) : null}
        </motion.article>
    );
});
