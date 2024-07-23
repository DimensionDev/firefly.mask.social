import { compact } from 'lodash-es';
import { memo, useMemo } from 'react';
import urlcat from 'urlcat';

import { Bookmark } from '@/components/Actions/Bookmark.js';
import { Collect } from '@/components/Actions/Collect.js';
import { Comment } from '@/components/Actions/Comment.js';
import { Like } from '@/components/Actions/Like.js';
import { Mirror } from '@/components/Actions/Mirrors.js';
import { PostStatistics } from '@/components/Actions/PostStatistics.js';
import { Share } from '@/components/Actions/Share.js';
import { Views } from '@/components/Actions/Views.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tips } from '@/components/Tips/index.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { resolveProfileId } from '@/helpers/resolveProfileId.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface PostActionsWithGridProps extends React.HTMLAttributes<HTMLDivElement> {
    post: Post;
    disabled?: boolean;
    disablePadding?: boolean;
}

export const PostActionsWithGrid = memo<PostActionsWithGridProps>(function PostActionsWithGrid({
    className,
    post,
    disabled = false,
    disablePadding = false,
}) {
    const publicationViews = useImpressionsStore.use.publicationViews();
    const isSmall = useIsSmall('max');
    const isComment = post.type === 'Comment';

    const views = useMemo(() => {
        return publicationViews.find((x) => x.id === post.postId)?.views;
    }, [publicationViews, post]);

    const identity = resolveProfileId(post.author);

    const actions = compact([
        <div key="comment">
            <Comment
                disabled={disabled}
                count={post.stats?.comments}
                canComment={post.canComment}
                source={post.source}
                author={post.author.handle}
                post={post}
                hiddenCount
            />
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
                />
            </div>
        ) : null,
        <div key="like">
            <Like
                isComment={isComment}
                count={post.stats?.reactions}
                hasLiked={post.hasLiked}
                postId={post.postId}
                source={post.source}
                authorId={post.source === Source.Farcaster ? post.author.profileId : undefined}
                disabled={disabled}
                hiddenCount
            />
        </div>,
        post.source === Source.Farcaster || post.source === Source.Twitter || isSmall ? null : (
            <Views key="views" count={views} disabled={disabled} />
        ),
        identity ? (
            <Tips key="tips" identity={identity} source={post.source} disabled={disabled} handle={post.author.handle} />
        ) : null,
        <Bookmark key="bookmark" count={post.stats?.bookmarks} disabled={disabled} post={post} hiddenCount />,
        <Share key="share" url={urlcat(location.origin, getPostUrl(post))} disabled={disabled} />,
    ]);
    const actionLength = actions.length;

    return (
        <ClickableArea
            className={classNames('mt-2 grid grid-flow-col items-center', className, {
                'pl-[52px]': !disablePadding,
            })}
            style={{
                gridTemplateColumns: `repeat(${actionLength - 1}, 1fr)`,
            }}
        >
            {actions}
        </ClickableArea>
    );
});

interface PostActionsProps extends React.HTMLAttributes<HTMLDivElement> {
    showChannelTag?: boolean;
    post: Post;
    disabled?: boolean;
    disablePadding?: boolean;
    onSetScrollIndex?: () => void;
}

export const PostActions = memo<PostActionsProps>(function PostActions({
    className,
    post,
    disabled = false,
    disablePadding = false,
    showChannelTag,
    onSetScrollIndex,
    ...rest
}) {
    const isComment = post.type === 'Comment';

    const identity = resolveProfileId(post.author);

    return (
        <div
            className={classNames('mt-2 text-xs text-second', className, {
                'pl-[52px]': !disablePadding,
            })}
            {...rest}
        >
            <ClickableArea className="flex justify-between">
                <div className="flex -translate-x-1.5 items-center space-x-2">
                    <Comment
                        disabled={disabled}
                        count={post.stats?.comments}
                        canComment={post.canComment}
                        source={post.source}
                        author={post.author.handle}
                        post={post}
                        hiddenCount
                    />
                    <Mirror
                        disabled={disabled}
                        shares={(post.stats?.mirrors || 0) + (post.stats?.quotes || 0)}
                        source={post.source}
                        postId={post.postId}
                        post={post}
                        hiddenCount
                    />
                    <Like
                        isComment={isComment}
                        count={post.stats?.reactions}
                        hasLiked={post.hasLiked}
                        postId={post.postId}
                        source={post.source}
                        authorId={post.source === Source.Farcaster ? post.author.profileId : undefined}
                        disabled={disabled}
                        hiddenCount
                    />
                </div>
                <div className="flex translate-x-1.5 items-center space-x-2">
                    {post.source !== Source.Farcaster && post.canAct ? (
                        <Collect
                            count={post.stats?.countOpenActions}
                            disabled={disabled}
                            collected={post.hasActed}
                            hiddenCount
                        />
                    ) : null}
                    <Bookmark count={post.stats?.bookmarks} disabled={disabled} post={post} hiddenCount />
                    {identity ? (
                        <Tips
                            identity={identity}
                            source={post.source}
                            disabled={disabled}
                            handle={post.author.handle}
                        />
                    ) : null}
                    {post.source !== Source.Twitter ? (
                        <Share key="share" url={urlcat(location.origin, getPostUrl(post))} disabled={disabled} />
                    ) : null}
                </div>
            </ClickableArea>
            <PostStatistics post={post} showChannelTag={showChannelTag} onSetScrollIndex={onSetScrollIndex} />
        </div>
    );
});
