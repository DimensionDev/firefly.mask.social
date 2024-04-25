import { SinglePost } from '@/components/Posts/SinglePost.js';
import { type Post } from '@/providers/types/SocialMedia.js';

export function getPostItemContent(index: number, post: Post, listKey?: string) {
    return <SinglePost post={post} key={`${post.postId}-${index}`} showMore listKey={listKey} index={index} />;
}
