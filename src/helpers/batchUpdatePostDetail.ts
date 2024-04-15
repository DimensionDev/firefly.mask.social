import { queryClient } from '@/configs/queryClient.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function batchUpdatePostDetail(posts: Post[]) {
    posts.forEach((post) => {
        queryClient.setQueryData([post.source, 'post-detail', post.postId], post);
        queryClient.setQueryData(['profile', post.source, post.author.profileId], post.author);
        queryClient.setQueryData(['profile', post.source, post.author.handle], post.author);
    });
}
