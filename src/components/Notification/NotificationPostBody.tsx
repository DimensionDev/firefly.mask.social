import { memo, useState } from 'react';

import { PostMarkup } from '@/components/Markup/PostMarkup.js';
import { PostLinks } from '@/components/Posts/PostLinks.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface NotificationPostBodyProps {
    post: Post;
}

export const NotificationPostBody = memo<NotificationPostBodyProps>(function NotificationPostBody({ post }) {
    const [postContent, setPostContent] = useState(post.metadata.content?.content ?? '');
    return (
        <>
            <PostMarkup post={post} canShowMore={false} content={postContent} />
            <PostLinks post={post} setContent={setPostContent} />
        </>
    );
});
