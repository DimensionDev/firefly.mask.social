import { memo, useMemo } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { getPostDetailUrl } from '@/helpers/getPostDetailUrl.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

import { Collect } from './Collect.js';
import { Comment } from './Comment.js';
import { Like } from './Like.js';
import { Mirror } from './Mirrors.js';
import { Share } from './Share.js';
import { Views } from './Views.js';

interface PostActionsProps {
    post: Post;
    disabled?: boolean;
}

// TODO: open compose dialog
export const PostActions = memo<PostActionsProps>(function PostActions({ post, disabled = false }) {
    const publicationViews = useImpressionsStore.use.publicationViews();

    const views = useMemo(() => {
        return publicationViews.find((x) => x.id === post.postId)?.views;
    }, [publicationViews, post]);

    return (
        <span className="mt-2 flex items-center justify-between pl-[52px]">
            <Comment
                disabled={disabled}
                count={post.stats?.comments}
                canComment={post.canComment}
                source={post.source}
                author={post.author.displayName}
            />
            <Mirror
                disabled={disabled}
                shares={(post.stats?.mirrors ?? 0) + (post.stats?.quotes ?? 0)}
                source={post.source}
                postId={post.postId}
                hasMirrored={post.hasMirrored}
            />
            {post.source !== SocialPlatform.Farcaster ? (
                <Collect count={post.stats?.bookmarks} disabled={disabled} />
            ) : null}
            <Like
                count={post.stats?.reactions}
                hasLiked={post?.hasLiked}
                postId={post.postId}
                source={post.source}
                disabled={disabled}
            />
            {post.source !== SocialPlatform.Farcaster ? <Views count={views} disabled={disabled} /> : null}
            <Share url={getPostDetailUrl(post.postId, post.source)} disabled={disabled} />
        </span>
    );
});
