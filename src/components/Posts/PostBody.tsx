'use client';

import { Trans } from '@lingui/macro';
import { useRouter } from 'next/navigation.js';
import { forwardRef, useState } from 'react';
import { useAsync } from 'react-use';

import EyeSlash from '@/assets/eye-slash.svg';
import Lock from '@/assets/lock.svg';
import { Markup, NakedMarkup } from '@/components/Markup/index.js';
import Oembed from '@/components/Oembed/index.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { getEncryptedPayloadFromText, getEncryptedPyloadFromImageAttachment } from '@/helpers/getEncryptedPayload.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import removeUrlAtEnd from '@/helpers/removeUrlAtEnd.js';
import type { Post } from '@/providers/types/SocialMedia.js';

import { Attachments } from './Attachment.js';
import { Quote } from './Quote.js';

interface PostBodyProps {
    post: Post;
    isQuote?: boolean;
    showMore?: boolean;
    disablePadding?: boolean;
}

export const PostBody = forwardRef<HTMLDivElement, PostBodyProps>(function PostBody(
    { post, isQuote = false, showMore = false, disablePadding = false },
    ref,
) {
    const router = useRouter();
    const canShowMore = !!(post.metadata.content?.content && post.metadata.content.content.length > 450) && showMore;
    const showAttachments = !!post.metadata.content?.attachments?.length || !!post.metadata.content?.asset;

    const [oembedLoaded, setOembedLoaded] = useState(false);

    const { value: payload, loading } = useAsync(async () => {
        const payloadFromText = getEncryptedPayloadFromText(post);
        const payloadFromImageAttachment = await getEncryptedPyloadFromImageAttachment(post);

        return payloadFromImageAttachment ?? payloadFromText;
    }, [post]);

    if (post.isEncrypted) {
        return (
            <div
                className={classNames('my-2', {
                    'pl-[52px]': !disablePadding,
                })}
                ref={ref}
            >
                <div
                    className={classNames('flex items-center gap-1 rounded-lg border-primaryMain px-3 py-[6px]', {
                        border: !isQuote,
                    })}
                >
                    <Lock width={16} height={16} />
                    <Trans>Post has been encrypted</Trans>
                </div>
            </div>
        );
    }

    if (post.isHidden) {
        <div
            className={classNames('my-2', {
                'pl-[52px]': !disablePadding,
            })}
            ref={ref}
        >
            <div
                className={classNames('flex items-center gap-1 rounded-lg border-primaryMain px-3 py-[6px]', {
                    border: !isQuote,
                })}
            >
                <EyeSlash width={16} height={16} />
                <Trans>Post has been hidden</Trans>
            </div>
        </div>;
    }

    if (isQuote) {
        return (
            <div className="my-2 flex items-center space-x-2 break-words text-base text-main">
                <NakedMarkup
                    post={post}
                    className="linkify text-md line-clamp-5 w-full self-stretch break-words opacity-75"
                >
                    {post.metadata.content?.content}
                </NakedMarkup>
                {showAttachments ? (
                    <Attachments
                        post={post}
                        asset={post.metadata.content?.asset}
                        attachments={post.metadata.content?.attachments ?? EMPTY_LIST}
                        isQuote
                    />
                ) : null}
            </div>
        );
    }

    return (
        <div
            className={classNames('-mt-2 mb-2 break-words text-base text-main', {
                ['pl-[52px]']: !disablePadding,
            })}
            ref={ref}
        >
            {payload ? (
                <mask-decrypted-post
                    props={encodeURIComponent(
                        JSON.stringify({
                            post,
                            payload,
                        }),
                    )}
                />
            ) : (
                <Markup
                    post={post}
                    className={classNames({ 'line-clamp-5': canShowMore }, 'markup linkify text-md break-words')}
                >
                    {oembedLoaded
                        ? removeUrlAtEnd(post.metadata.content?.oembedUrl, post.metadata.content?.content)
                        : post.metadata.content?.content}
                </Markup>
            )}

            {canShowMore ? (
                <div className="text-base font-bold text-link">
                    <div
                        onClick={(event) => {
                            router.push(getPostUrl(post));
                        }}
                    >
                        <Trans>Show More</Trans>
                    </div>
                </div>
            ) : null}
            {showAttachments ? (
                <Attachments
                    post={post}
                    asset={post.metadata.content?.asset}
                    attachments={post.metadata.content?.attachments ?? EMPTY_LIST}
                />
            ) : null}
            {post.metadata.content?.oembedUrl ? (
                <Oembed url={post.metadata.content.oembedUrl} onData={() => setOembedLoaded(true)} />
            ) : null}
            {!!post.quoteOn && !isQuote ? <Quote post={post.quoteOn} /> : null}
        </div>
    );
});
