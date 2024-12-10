'use client';

import { Trans } from '@lingui/macro';
import { forwardRef, type HTMLProps } from 'react';

import Lock from '@/assets/lock.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { type PostBodyProps } from '@/components/Posts/PostBody.js';
import { dynamic } from '@/esm/dynamic.js';
import { classNames } from '@/helpers/classNames.js';
import { useDecryptPost } from '@/hooks/useDecryptPost.js';
import type { Post } from '@/providers/types/SocialMedia.js';

const PostBody = dynamic(() => import('@/components/Posts/PostBody.js').then((m) => m.PostBody), { ssr: false });

interface EncryptedPostProps extends HTMLProps<HTMLDivElement> {
    post: Post;
    isQuote?: boolean;
    disableDecrypt?: boolean;
    postBodyProps?: Partial<PostBodyProps>;
}

export const EncryptedPost = forwardRef<HTMLDivElement, EncryptedPostProps>(function EncryptedPost(
    { post, isQuote, disableDecrypt = false, postBodyProps, className },
    ref,
) {
    const [{ loading, value: decryptedPost }, decryptPost] = useDecryptPost(post);

    if (!loading && decryptedPost) {
        return <PostBody {...postBodyProps} post={decryptedPost} disableDecrypt />;
    }

    return (
        <div className={className} ref={ref}>
            <div
                className={classNames(
                    'flex items-center gap-1 rounded-lg border-primaryMain px-3 py-[6px] text-medium',
                    {
                        border: !isQuote,
                    },
                )}
            >
                <Lock width={16} height={16} />
                {loading ? <Trans>Post is decrypting...</Trans> : <Trans>Post has been encrypted</Trans>}
                {!loading && !disableDecrypt && post.canDecrypt ? (
                    <ClickableButton
                        onClick={decryptPost}
                        className="p-1 text-sm font-semibold text-highlight hover:bg-highlight/25"
                    >
                        <Trans>Try decrypt</Trans>
                    </ClickableButton>
                ) : null}
            </div>
        </div>
    );
});
