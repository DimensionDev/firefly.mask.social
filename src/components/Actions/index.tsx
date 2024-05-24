import { compact } from 'lodash-es';
import { memo, useMemo } from 'react';
import urlcat from 'urlcat';

import { Collect } from '@/components/Actions/Collect.js';
import { Comment } from '@/components/Actions/Comment.js';
import { Like } from '@/components/Actions/Like.js';
import { Mirror } from '@/components/Actions/Mirrors.js';
import { Share } from '@/components/Actions/Share.js';
import { Views } from '@/components/Actions/Views.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface PostActionsProps extends React.HTMLAttributes<HTMLDivElement> {
    post: Post;
    disabled?: boolean;
    disablePadding?: boolean;
}

// TODO: open compose dialog
export const PostActions = memo<PostActionsProps>(function PostActions({
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

    const actions = compact([
        <Comment
            key="comment"
            disabled={disabled}
            count={post.stats?.comments}
            canComment={post.canComment}
            source={post.source}
            author={post.author.handle}
            post={post}
        />,
        <Mirror
            key="mirror"
            disabled={disabled}
            shares={(post.stats?.mirrors || 0) + (post.stats?.quotes || 0)}
            source={post.source}
            postId={post.postId}
            post={post}
        />,

        post.source !== Source.Farcaster && post.canAct ? (
            <Collect key="collect" count={post.stats?.countOpenActions} disabled={disabled} collected={post.hasActed} />
        ) : null,
        <Like
            key="like"
            isComment={isComment}
            count={post.stats?.reactions}
            hasLiked={post.hasLiked}
            postId={post.postId}
            source={post.source}
            authorId={post.source === Source.Farcaster ? post.author.profileId : undefined}
            disabled={disabled}
        />,
        post.source === Source.Farcaster || post.source === Source.Twitter || isSmall ? null : (
            <Views key="views" count={views} disabled={disabled} />
        ),
        <Share key="share" url={urlcat(location.origin, getPostUrl(post))} disabled={disabled} />,
    ]);
    const actionLength = actions.length;

    if (post.source === Source.Twitter) {
        return null;
    }

    return (
        <ClickableArea
            className={classNames('mt-2 grid grid-flow-col items-center', className, {
                'pl-[52px]': !disablePadding,
                'grid-cols-3': actionLength === 4,
                'grid-cols-4': actionLength === 5,
                'grid-cols-5': actionLength === 6,
                'grid-cols-6': actionLength === 7,
            })}
        >
            {actions}
        </ClickableArea>
    );
});
