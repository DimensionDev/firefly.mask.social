import { SinglePost, type SinglePostProps } from '@/components/Posts/SinglePost.js';
import { type Post } from '../../providers/types/SocialMedia.js';

export function getPostItemContent(index: number, post: Post, postProps?: Partial<SinglePostProps>) {
    return <SinglePost post={post} key={`${post.postId}-${index}`} showMore {...postProps} />;
}
