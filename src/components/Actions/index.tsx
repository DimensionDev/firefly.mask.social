import { memo } from 'react';

import type { Post } from '@/providers/types/SocialMedia.js';

import { Comment } from './Comment.js';
import { Mirror } from './Mirrors.js';

interface PostActionsProps {
    post: Post;
}

// TODO: open compose dialog
export const PostActions = memo<PostActionsProps>(function PostActions({ post }) {
    return (
        <span className="mt-2 flex items-center justify-between pl-[52px]">
            <Comment
                count={post.stats?.comments}
                disabled={post.canComment}
                source={post.source}
                author={post.author.displayName}
            />
            <Mirror
                shares={(post.stats?.mirrors ?? 0) + (post.stats?.quotes ?? 0)}
                source={post.source}
                postId={post.postId}
            />
            <div />
            <div />
            <div />
            <div />
        </span>
    );
});
