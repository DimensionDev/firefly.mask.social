import type { Post } from '@/providers/types/SocialMedia.js';

export function resolveOembedUrl(post: Pick<Post, 'metadata'>) {
    if (
        !post.metadata.content?.oembedUrl ||
        !post.metadata.content?.attachments ||
        !post.metadata.content?.oembedUrls
    ) {
        return post.metadata.content?.oembedUrl;
    }
    const attachmentsUrls = post.metadata.content.attachments.map((x) => x.uri);
    if (!attachmentsUrls.includes(post.metadata.content.oembedUrl)) return post.metadata.content.oembedUrl;
    for (let i = post.metadata.content?.oembedUrls.length - 1; i >= 0; i -= 1) {
        const url = post.metadata.content?.oembedUrls[i];
        if (!attachmentsUrls.includes(url)) return url;
    }
    return post.metadata.content.oembedUrl;
}
