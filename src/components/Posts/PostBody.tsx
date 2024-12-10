'use client';

import { forwardRef } from 'react';

import { EncryptedPost } from '@/components/Posts/EncryptedPost.js';
import { PostBodyContent, type PostBodyContentProps } from '@/components/Posts/PostBodyContent.js';
import { classNames } from '@/helpers/classNames.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';

export const PostBody = forwardRef<HTMLDivElement, PostBodyContentProps>(function PostBody(props, ref) {
    const isSmall = useIsSmall('max');

    const noLeftPadding = props.isDetail || isSmall || props.disablePadding;

    if (props.post.isEncrypted) {
        return (
            <EncryptedPost
                post={props.post}
                postBodyProps={props}
                isQuote={props.isQuote}
                disableDecrypt={props.disableDecrypt}
                className={classNames({
                    '-mt-3 pl-[52px]': !noLeftPadding,
                    'my-2': !props.isQuote,
                })}
                ref={ref}
            />
        );
    }

    return <PostBodyContent {...props} />;
});
