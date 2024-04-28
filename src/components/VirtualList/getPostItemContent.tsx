import { SinglePost, type SinglePostProps } from '@/components/Posts/SinglePost.js';
import { type Post } from '@/providers/types/SocialMedia.js';

export function getPostItemContent(index: number, post: Post, listKey?: string, postProps?: Partial<SinglePostProps>) {
    return (
        <SinglePost
            post={post}
            key={`${post.id}-${post.postId}-${index}`}
            showMore
            listKey={listKey}
            index={index}
            {...postProps}
        />
    );
}
