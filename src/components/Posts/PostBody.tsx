import { Markup } from '@/components/Markup/index.js';
import { Attachments } from '@/components/Posts/Attachment.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { memo } from 'react';
import EyeSlash from '@/assets/eye-slash.svg';

interface PostBodyProps {
    post: Post;
}

export const PostBody = memo<PostBodyProps>(function PostBody({ post }) {
    const canShowMore = !!(post.metadata.content?.content && post.metadata.content?.content.length > 450);
    const showAttachments = !!(
        (post.metadata.content?.attachments && post.metadata.content?.attachments?.length > 0) ||
        post.metadata.content?.asset
    );

    if (post.isEncrypted) {
        return (
            <div className="my-2 pl-[52px]">
                <div className="border-primaryMain flex items-center gap-1  rounded-lg border px-3 py-[6px]">
                    <EyeSlash width={16} height={16} />
                    Post has been encrypted
                </div>
            </div>
        );
    }

    return (
        <div className="text- my-2 break-words pl-[52px] text-base text-main">
            <Markup className="markup linkify text-md break-words">{post.metadata.content?.content || ''}</Markup>

            {canShowMore ? <div className="text-link text-base font-bold">Show More</div> : null}
            {showAttachments ? (
                <Attachments
                    asset={post.metadata.content?.asset}
                    attachments={post.metadata.content?.attachments ?? []}
                />
            ) : null}
        </div>
    );
});
