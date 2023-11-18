import { Markup } from '@/components/Markup/index.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { memo } from 'react';

interface PostBodyProps {
    post: Post;
}

export const PostBody = memo<PostBodyProps>(function PostBody({ post }) {
    return (
        <div className="break-words">
            <Markup className="markup linkify text-md break-words">{post.metadata.content?.content || ''}</Markup>
        </div>
    );
});
