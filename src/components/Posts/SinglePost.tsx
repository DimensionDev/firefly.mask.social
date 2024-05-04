'use client';

import { Trans } from '@lingui/macro';
import { motion } from 'framer-motion';
import { isUndefined } from 'lodash-es';
import { usePathname, useRouter } from 'next/navigation.js';
import { memo, useMemo } from 'react';

import { Avatar } from '@/components/Avatar.js';
import { ChannelCard } from '@/components/Channel/ChannelCard.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { FeedActionType } from '@/components/Posts/ActionType.js';
import { PostBody } from '@/components/Posts/PostBody.js';
import { PostHeader } from '@/components/Posts/PostHeader.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { SocialPlatform } from '@/constants/enum.js';
import { dynamic } from '@/esm/dynamic.js';
import { Tippy } from '@/esm/Tippy.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
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
            {!!post.channel && post.type === 'Post' ? (
                <ClickableArea className="my-2 flex justify-end">
                    <Tippy
                        maxWidth={400}
                        className="channel-card"
                        placement="bottom"
                        duration={200}
                        arrow={false}
                        trigger="mouseenter"
                        hideOnClick
                        interactive
                        content={<ChannelCard channel={post.channel} />}
                    >
                        <div
                            onClick={() => {
                                if (!post.channel) return;
                                router.push(getChannelUrl(post.channel));
                            }}
                            className="flex items-center gap-1 rounded-full border border-secondaryLine bg-bg px-2 py-1"
                        >
                            {post.channel.imageUrl ? (
                                <Avatar
                                    src={post.channel.imageUrl}
                                    alt={post.channel.id}
                                    size={16}
                                    className="h-4 w-4 rounded-full"
                                />
                            ) : (
                                <SourceIcon className="rounded-full" source={post.channel.source} size={16} />
                            )}
                            <span className="text-[15px] text-secondary">/{post.channel.id}</span>
                        </div>
                    </Tippy>
                </ClickableArea>
            ) : null}
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
