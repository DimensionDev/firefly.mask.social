'use client';

import { useQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { usePathname } from 'next/navigation.js';
import { type HTMLProps, memo } from 'react';

import { Bookmark } from '@/components/Actions/Bookmark.js';
import { Collect } from '@/components/Actions/Collect.js';
import { Comment } from '@/components/Actions/Comment.js';
import { Like } from '@/components/Actions/Like.js';
import { Mirror } from '@/components/Actions/Mirrors.js';
import { PostStatistics } from '@/components/Actions/PostStatistics.js';
import { Share } from '@/components/Actions/Share.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tips } from '@/components/Tips/index.js';
import { PageRoute, Source } from '@/constants/enum.js';
import { NotFoundError } from '@/constants/error.js';
import { classNames } from '@/helpers/classNames.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { resolveFireflyProfileId } from '@/helpers/resolveFireflyProfileId.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useFireflyIdentity } from '@/hooks/useFireflyIdentity.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import { useToggleBookmark } from '@/hooks/useToggleBookmark.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface PostActionsWithGridProps extends HTMLProps<HTMLDivElement> {
    disablePadding?: boolean;
    post: Post;
    isDetail?: boolean;
}

export const PostActionsWithGrid = memo<PostActionsWithGridProps>(function PostActionsWithGrid({
    className,
    post: initialPost,
    isDetail = false,
    disabled = false,
    disablePadding = false,
}) {
    const postId = initialPost.postId;

    const { data: post = initialPost } = useQuery({
        queryKey: [initialPost.source, 'post-detail', 'actions', initialPost.postId],
        queryFn: async () => {
            if (!postId) return;

            try {
                const provider = resolveSocialMediaProvider(initialPost.source);
                const post = await provider.getPostById(postId);
                if (!post) return;
                return post;
            } catch (error) {
                if (error instanceof NotFoundError) return;
                throw error;
            }
        },
        enabled: isDetail,
    });

    const isComment = post.type === 'Comment';
    const identity = useFireflyIdentity(post.source, resolveFireflyProfileId(post.author) ?? '');
    const mutation = useToggleBookmark(post.source);
    const actions = compact([
        <div key="comment">
            <Comment post={post} hiddenCount disabled={disabled} />
        </div>,
        <div key="mirror">
            <Mirror
                disabled={disabled}
                shares={(post.stats?.mirrors || 0) + (post.stats?.quotes || 0)}
                source={post.source}
                postId={post.postId}
                post={post}
                hiddenCount
            />
        </div>,

        post.source !== Source.Farcaster && post.canAct ? (
            <div key="collect">
                <Collect
                    count={post.stats?.countOpenActions}
                    disabled={disabled}
                    collected={post.hasActed}
                    hiddenCount
                    post={post}
                />
            </div>
        ) : null,
        post.source !== Source.Twitter ? (
            <div key="like">
                <Like isComment={isComment} post={post} disabled={disabled} hiddenCount />
            </div>
        ) : null,
        identity.id ? (
            <Tips key="tips" post={post} identity={identity} disabled={disabled} handle={post.author.handle} />
        ) : null,
        post.source !== Source.Twitter ? (
            <Bookmark
                key="bookmark"
                count={post.stats?.bookmarks}
                disabled={disabled}
                hasBookmarked={post.hasBookmarked}
                onClick={() => {
                    mutation.mutate(post);
                }}
                hiddenCount
            />
        ) : null,
        <Share key="share" className="!flex-none" post={post} disabled={disabled} />,
    ]);

    return (
        <ClickableArea
            className={classNames('mt-2 flex items-center justify-between text-lightSecond', className, {
                'pl-[52px]': !disablePadding,
            })}
        >
            {actions}
        </ClickableArea>
    );
});

interface PostActionsProps extends HTMLProps<HTMLDivElement> {
    showChannelTag?: boolean;
    post: Post;
    disablePadding?: boolean;
    hideDate?: boolean;
    onSetScrollIndex?: () => void;
}

export const PostActions = memo<PostActionsProps>(function PostActions({
    post,
    className,
    disabled = false,
    disablePadding = false,
    showChannelTag,
    hideDate,
    onSetScrollIndex,
    ...rest
}) {
    const pathname = usePathname();

    const isSmall = useIsSmall('max');
    const isComment = post.type === 'Comment';
    const isDetailPage = isRoutePathname(pathname, PageRoute.PostDetail, true);

    const identity = useFireflyIdentity(post.source, resolveFireflyProfileId(post.author) ?? '');

    const noLeftPadding = isDetailPage || isSmall || disablePadding;
    const mutation = useToggleBookmark(post.source);

    return (
        <footer
            className={classNames('mt-2 text-xs text-lightSecond', className, {
                'pl-[52px]': !noLeftPadding,
            })}
            {...rest}
        >
            <ClickableArea className="flex justify-between">
                <div className="flex -translate-x-1.5 items-center space-x-2">
                    <Comment post={post} hiddenCount disabled={disabled} />
                    <Mirror
                        disabled={disabled}
                        shares={(post.stats?.mirrors || 0) + (post.stats?.quotes || 0)}
                        source={post.source}
                        postId={post.postId}
                        post={post}
                        hiddenCount
                    />
                    {post.source !== Source.Twitter ? (
                        <Like isComment={isComment} post={post} disabled={disabled} hiddenCount />
                    ) : null}
                </div>
                <div className="flex translate-x-1.5 items-center space-x-2">
                    {post.source !== Source.Farcaster && post.canAct ? (
                        <Collect
                            post={post}
                            count={post.stats?.countOpenActions}
                            disabled={disabled}
                            collected={post.hasActed}
                            hiddenCount
                        />
                    ) : null}
                    {post.source !== Source.Twitter ? (
                        <Bookmark
                            onClick={() => {
                                mutation.mutate(post);
                            }}
                            count={post.stats?.bookmarks}
                            disabled={disabled}
                            hasBookmarked={post.hasBookmarked}
                            hiddenCount
                        />
                    ) : null}
                    {identity.id ? (
                        <Tips post={post} identity={identity} disabled={disabled} handle={post.author.handle} />
                    ) : null}
                    <Share key="share" disabled={disabled} post={post} />
                </div>
            </ClickableArea>
            <PostStatistics
                hideDate={hideDate}
                hideSource={hideDate}
                isComment={isComment}
                post={post}
                showChannelTag={showChannelTag}
                onSetScrollIndex={onSetScrollIndex}
            />
        </footer>
    );
});
