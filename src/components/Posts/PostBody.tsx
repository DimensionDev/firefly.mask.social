'use client';

import { Markup } from '@/components/Markup/index.js';
import { Attachments } from '@/components/Posts/Attachment.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { memo } from 'react';
import EyeSlash from '@/assets/eye-slash.svg';
import Lock from '@/assets/lock.svg';
import { classNames } from '@/helpers/classNames.js';
import { Quote } from '@/components/Posts/Quote.js';
import { Link } from '@/esm/Link.js';
import urlcat from 'urlcat';
interface PostBodyProps {
    post: Post;
    isQuote?: boolean;
    showMore?: boolean;
}

export const PostBody = memo<PostBodyProps>(function PostBody({ post, isQuote = false, showMore = false }) {
    const canShowMore = !!(post.metadata.content?.content && post.metadata.content?.content.length > 450) && showMore;
    const showAttachments = !!(
        (post.metadata.content?.attachments && post.metadata.content?.attachments?.length > 0) ||
        post.metadata.content?.asset
    );

    if (post.isEncrypted) {
        return (
            <div className="my-2 pl-[52px]">
                <div
                    className={classNames('flex items-center gap-1 rounded-lg border-primaryMain px-3 py-[6px]', {
                        border: !isQuote,
                    })}
                >
                    <Lock width={16} height={16} />
                    Post has been encrypted
                </div>
            </div>
        );
    }

    if (post.isHidden) {
        <div className="my-2 pl-[52px]">
            <div
                className={classNames('flex items-center gap-1 rounded-lg border-primaryMain px-3 py-[6px]', {
                    border: !isQuote,
                })}
            >
                <EyeSlash width={16} height={16} />
                Post has been hidden
            </div>
        </div>;
    }

    return (
        <div className={classNames('text- my-2 break-words text-base text-main', { 'pl-[52px]': !isQuote })}>
            <Markup className={classNames({ 'line-clamp-5': canShowMore }, 'markup linkify text-md break-words')}>
                {post.metadata.content?.content || ''}
            </Markup>

            {canShowMore ? (
                <div className="text-base font-bold text-link">
                    <Link href={urlcat('/detail/:platform/:id', { platform: post.source, id: post.postId })}>
                        Show More
                    </Link>
                </div>
            ) : null}
            {showAttachments ? (
                <Attachments
                    asset={post.metadata.content?.asset}
                    attachments={post.metadata.content?.attachments ?? []}
                />
            ) : null}
            {!!post.quoteOn && !isQuote ? <Quote post={post.quoteOn} /> : null}
        </div>
    );
});
