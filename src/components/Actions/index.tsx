import { type HTMLProps, memo, useMemo } from 'react';
import urlcat from 'urlcat';

import { Collect } from '@/components/Actions/Collect.js';
import { Comment } from '@/components/Actions/Comment.js';
import { Like } from '@/components/Actions/Like.js';
import { Mirror } from '@/components/Actions/Mirrors.js';
import { Share } from '@/components/Actions/Share.js';
import { Views } from '@/components/Actions/Views.js';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface PostActionsProps extends HTMLProps<HTMLDivElement> {
    post: Post;
    disabled?: boolean;
    disablePadding?: boolean;
}

// TODO: open compose dialog
export const PostActions = memo<PostActionsProps>(function PostActions({
    post,
    disabled = false,
    disablePadding = false,
    className,
    ...rest
}) {
    const publicationViews = useImpressionsStore.use.publicationViews();

    const views = useMemo(() => {
        return publicationViews.find((x) => x.id === post.postId)?.views;
    }, [publicationViews, post]);

    return (
        <div
            className={classNames('mt-2 grid grid-flow-col items-center', className, {
                'pl-[52px]': !disablePadding,
                'grid-cols-3': post.source === SocialPlatform.Farcaster,
                'grid-cols-4': !post.canAct && post.source === SocialPlatform.Lens,
                'grid-cols-5': !!post.canAct && post.source === SocialPlatform.Lens,
            })}
            onClick={(e) => e.stopPropagation()}
            {...rest}
        >
            <Comment
                disabled={disabled}
                count={post.stats?.comments}
                canComment={post.canComment}
                source={post.source}
                author={post.author.handle}
                post={post}
            />
            <Mirror
                disabled={disabled}
                shares={(post.stats?.mirrors ?? 0) + (post.stats?.quotes ?? 0)}
                source={post.source}
                postId={post.postId}
                post={post}
            />
            {post.source !== SocialPlatform.Farcaster && post.canAct ? (
                <Collect count={post.stats?.countOpenActions} disabled={disabled} collected={post.hasActed} />
            ) : null}
            <Like
                count={post.stats?.reactions}
                hasLiked={post?.hasLiked}
                postId={post.postId}
                source={post.source}
                authorId={post.source === SocialPlatform.Farcaster ? post.author.profileId : undefined}
                disabled={disabled}
            />
            {post.source !== SocialPlatform.Farcaster ? <Views count={views} disabled={disabled} /> : null}
            <Share url={urlcat(location.origin, getPostUrl(post))} disabled={disabled} />
        </div>
    );
});
