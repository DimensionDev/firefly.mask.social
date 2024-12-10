'use client';

import { Trans } from '@lingui/macro';
import { forwardRef, type HTMLProps } from 'react';

import Lock from '@/assets/lock.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { PostBodyContent, type PostBodyContentProps } from '@/components/Posts/PostBodyContent.js';
import { classNames } from '@/helpers/classNames.js';
import { useDecryptPost } from '@/hooks/useDecryptPost.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface EncryptedPostProps extends HTMLProps<HTMLDivElement> {
    post: Post;
    isQuote?: boolean;
    disableDecrypt?: boolean;
    postBodyProps?: Partial<PostBodyContentProps>;
}

export const EncryptedPost = forwardRef<HTMLDivElement, EncryptedPostProps>(function EncryptedPost(
    { post, isQuote, disableDecrypt = false, postBodyProps, className },
    ref,
) {
    const [{ loading, value: decryptedPost }, decryptPost] = useDecryptPost(post);

    if (!loading && decryptedPost) {
        return <PostBodyContent {...postBodyProps} post={decryptedPost} disableDecrypt />;
    }

    return (
        <div className={className} ref={ref}>
            <div
                className={classNames(
                    'flex items-center justify-between rounded-lg border-primaryMain px-3 py-[6px] text-medium',
                    {
                        border: !isQuote,
                    },
                )}
            >
                <div className="flex items-center gap-1">
                    <Lock width={16} height={16} />
                    {loading ? <Trans>Post is decrypting...</Trans> : <Trans>Post has been encrypted</Trans>}
                </div>
                {!loading && !disableDecrypt && post.canDecrypt ? (
                    <ClickableButton onClick={decryptPost} className="text-base text-highlight">
                        <Trans>Decrypt</Trans>
                    </ClickableButton>
                ) : null}
            </div>
        </div>
    );
});
