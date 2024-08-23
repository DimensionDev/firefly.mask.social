import { motion } from 'framer-motion';
import { isUndefined } from 'lodash-es';
import { usePathname, useRouter } from 'next/navigation.js';
import { memo } from 'react';

import { PostActions, PostActionsWithGrid } from '@/components/Actions/index.js';
import { PostStatistics } from '@/components/Actions/PostStatistics.js';
import { FeedActionType } from '@/components/Posts/ActionType.js';
import { PostBody } from '@/components/Posts/PostBody.js';
import { PostHeader } from '@/components/Posts/PostHeader.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useIsProfileMuted } from '@/hooks/useIsProfileMuted.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface ThreadBodyProps {
    post: Post;
    disableAnimate?: boolean;
    isLast?: boolean;
    listKey?: string;
    index?: number;
    showTranslate?: boolean;
    isDetail?: boolean;
}

export const ThreadBody = memo<ThreadBodyProps>(function ThreadBody({
    post,
    disableAnimate,
    isLast = false,
    showTranslate = false,
    isDetail,
    listKey,
    index,
}) {
    const setScrollIndex = useGlobalState.use.setScrollIndex();
    const router = useRouter();

    const pathname = usePathname();

    const link = getPostUrl(post);
    const muted = useIsProfileMuted(post.author);

    const isSmall = useIsSmall('max');
    const isDetailPage = isRoutePathname(pathname, '/post/:detail', true);
    const showAction = !post.isHidden && !muted;

    return (
        <motion.article
            initial={!disableAnimate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cursor-pointer bg-bottom"
            onClick={() => {
                if (post.source === Source.Twitter) return;
                const selection = window.getSelection();
                if (selection && selection.toString().length !== 0) return;
                if (link.includes(pathname)) return;
                router.push(link);
            }}
        >
            <FeedActionType isDetail={isDetail} post={post} isThread />
            <PostHeader
                showDate={!!isDetail && !isLast}
                post={post}
                onClickProfileLink={() => {
                    if (listKey && !isUndefined(index)) setScrollIndex(listKey, index);
                }}
            />
            <div className="flex">
                {isDetail && isLast ? null : (
                    <div
                        className={classNames('ml-5 mr-8 border-[0.8px]', {
                            'border-transparent bg-transparent dark:border-transparent dark:bg-none': isLast,
                            'border-gray-300 bg-gray-300 dark:border-gray-700 dark:bg-gray-700': !isLast,
                        })}
                    />
                )}

                <div
                    className={classNames('w-full max-w-[calc(100%_-_53px)]', {
                        'pb-5': !isLast,
                        '-mt-[14px]': !isSmall && (!isDetailPage || !isLast),
                    })}
                >
                    <PostBody post={post} disablePadding showTranslate={showTranslate} />
                    {showAction ? (
                        isDetail && isLast ? null : (
                            <PostActions
                                hideDate={!!isDetail && !isLast}
                                post={post}
                                disabled={post.isHidden}
                                disablePadding
                                onSetScrollIndex={() => {
                                    if (listKey && !isUndefined(index)) setScrollIndex(listKey, index);
                                }}
                            />
                        )
                    ) : null}
                </div>
            </div>
            {showAction && isDetail && isLast ? (
                <div className="-mx-4">
                    <PostStatistics post={post} className="mb-1.5 px-4" />
                    <PostActionsWithGrid
                        disablePadding
                        post={post}
                        disabled={post.isHidden}
                        className="!mt-0 border-b border-t border-line py-3 pl-2.5 pr-4"
                    />
                </div>
            ) : null}
        </motion.article>
    );
});
