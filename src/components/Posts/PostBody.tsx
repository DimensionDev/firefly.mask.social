'use client';

import { Trans } from '@lingui/macro';
import { EMPTY_LIST } from '@masknet/shared-base';
import { compact } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { forwardRef, useState } from 'react';
import { useInView } from 'react-cool-inview';
import { useAsync } from 'react-use';

import Lock from '@/assets/lock.svg';
import { Frame } from '@/components/Frame/index.js';
import { Markup } from '@/components/Markup/Markup.js';
import { NakedMarkup } from '@/components/Markup/NakedMarkup.js';
import { Oembed } from '@/components/Oembed/index.js';
import { Attachments } from '@/components/Posts/Attachment.js';
import { CollapsedContent } from '@/components/Posts/CollapsedContent.js';
import { Quote } from '@/components/Posts/Quote.js';
import { IS_APPLE, IS_SAFARI } from '@/constants/bowser.js';
import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { classNames } from '@/helpers/classNames.js';
import { getEncryptedPayloadFromImageAttachment, getEncryptedPayloadFromText } from '@/helpers/getEncryptedPayload.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { removeUrlAtEnd } from '@/helpers/removeUrlAtEnd.js';
import { useIsMuted } from '@/hooks/useIsMuted.js';
import type { Post } from '@/providers/types/SocialMedia.js';

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

    const [endingLinkCollapsed, setEndingLinkCollapsed] = useState(false);
    const [postViewed, setPostViewed] = useState(false);

    const { observe } = useInView({
        rootMargin: '300px 0px',
        onChange: async ({ inView }) => {
            if (inView && !postViewed) setPostViewed(true);
        },
    });

    const { value: payloads } = useAsync(async () => {
        // decode the image upon post viewing, to reduce unnecessary load of images
        if (!postViewed) return;

        // mask web components are disabled
        if (env.external.NEXT_PUBLIC_MASK_WEB_COMPONENTS === STATUS.Disabled) return;

        return {
            payloadFromText: getEncryptedPayloadFromText(post),
            payloadFromImageAttachment: await getEncryptedPayloadFromImageAttachment(post),
        };
    }, [post, postViewed]);

    const muted = useIsMuted(post.author);

    console.log('DEBUG: test');
    console.log(post.metadata.content?.oembedUrls);

    if (post.isEncrypted) {
        return (
            <div
                className={classNames('my-2', {
                    'pl-[52px]': !disablePadding,
                })}
                ref={ref}
            >
                <div
                    className={classNames(
                        'flex items-center gap-1 rounded-lg border-primaryMain px-3 py-[6px] text-[15px]',
                        {
                            border: !isQuote,
                        },
                    )}
                >
                    <Lock width={16} height={16} />
                    <Trans>Post has been encrypted</Trans>
                </div>
            </div>
        );
    }

    if (post.isHidden || muted) {
        return (
            <CollapsedContent
                className={classNames({
                    'pl-[52px]': !disablePadding,
                    'my-2': !isQuote,
                })}
                ref={ref}
                authorMuted={muted}
                isQuote={isQuote}
                disableIndent={disablePadding}
            />
        );
    }

    if (isQuote) {
        return (
            <div className="my-2 flex items-center space-x-2 break-words text-base text-main">
                <NakedMarkup
                    post={post}
                    className={classNames(
                        'linkify line-clamp-5 w-full self-stretch break-words text-[15px] opacity-75',
                        {
                            'max-h-[7.8rem]': IS_SAFARI && IS_APPLE,
                        },
                    )}
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
            <div ref={observe} />
            <Markup
                post={post}
                className={classNames(
                    { 'line-clamp-5': canShowMore, 'max-h-[8rem]': canShowMore && IS_SAFARI && IS_APPLE },
                    'markup linkify break-words text-[15px]',
                )}
            >
                {endingLinkCollapsed
                    ? removeUrlAtEnd(post.metadata.content?.oembedUrl, post.metadata.content?.content)
                    : post.metadata.content?.content}
            </Markup>

            {postViewed ? (
                payloads?.payloadFromImageAttachment || payloads?.payloadFromText ? (
                    <mask-decrypted-post
                        props={encodeURIComponent(
                            JSON.stringify({
                                post,
                                payloads: compact([payloads.payloadFromImageAttachment, payloads.payloadFromText]),
                            }),
                        )}
                    />
                ) : (
                    <mask-post-inspector props={encodeURIComponent(JSON.stringify({ post }))} />
                )
            ) : null}

            {canShowMore ? (
                <div className="text-[15px] font-bold text-link">
                    <div
                        onClick={(event) => {
                            router.push(getPostUrl(post));
                        }}
                    >
                        <Trans>Show More</Trans>
                    </div>
                </div>
            ) : null}

            {/* TODO: exclude the payload image from attachments */}
            {showAttachments &&
            (!payloads?.payloadFromImageAttachment ||
                env.external.NEXT_PUBLIC_MASK_WEB_COMPONENTS === STATUS.Disabled) ? (
                <Attachments
                    post={post}
                    asset={post.metadata.content?.asset}
                    attachments={post.metadata.content?.attachments ?? EMPTY_LIST}
                />
            ) : null}

            {post.metadata.content?.oembedUrls?.length && env.external.NEXT_PUBLIC_FRAMES === STATUS.Enabled ? (
                <Frame urls={post.metadata.content.oembedUrls} postId={post.postId}>
                    {post.metadata.content?.oembedUrl && !post.quoteOn ? (
                        <Oembed url={post.metadata.content.oembedUrl} onData={() => setEndingLinkCollapsed(true)} />
                    ) : null}
                </Frame>
            ) : post.metadata.content?.oembedUrl && !post.quoteOn ? (
                <Oembed url={post.metadata.content.oembedUrl} onData={() => setEndingLinkCollapsed(true)} />
            ) : null}

            {!!post.quoteOn && !isQuote ? <Quote post={post.quoteOn} /> : null}
        </div>
    );
});
