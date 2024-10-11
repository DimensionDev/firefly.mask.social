'use client';

import { Select, t, Trans } from '@lingui/macro';
import { useForkRef } from '@mui/material';
import { compact } from 'lodash-es';
import { usePathname, useRouter } from 'next/navigation.js';
import { forwardRef, type HTMLProps, useMemo, useState } from 'react';
import { useAsync } from 'react-use';

import Lock from '@/assets/lock.svg';
import { TwitterArticleBody } from '@/components/Article/TwitterArticleBody.js';
import { NakedMarkup } from '@/components/Markup/NakedMarkup.js';
import { PostMarkup } from '@/components/Markup/PostMarkup.js';
import { FramePoll } from '@/components/Poll/FramePoll.js';
import { PollCard } from '@/components/Poll/PollCard.js';
import { Attachments } from '@/components/Posts/Attachment.js';
import { CollapsedContent } from '@/components/Posts/CollapsedContent.js';
import { ContentTranslator } from '@/components/Posts/ContentTranslator.js';
import { PostLinks } from '@/components/Posts/PostLinks.js';
import { Quote } from '@/components/Posts/Quote.js';
import { TweetSpace } from '@/components/Posts/TweetSpace.js';
import { IS_APPLE, IS_SAFARI } from '@/constants/bowser.js';
import { PageRoute, Source, STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatUrl } from '@/helpers/formatUrl.js';
import { getEncryptedPayloadFromImageAttachment, getEncryptedPayloadFromText } from '@/helpers/getEncryptedPayload.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { isValidUrl } from '@/helpers/isValidUrl.js';
import { resolveOembedUrl } from '@/helpers/resolveOembedUrl.js';
import { resolvePostArticleUrl } from '@/helpers/resolvePostArticleUrl.js';
import { trimify } from '@/helpers/trimify.js';
import { useEverSeen } from '@/hooks/useEverSeen.js';
import { useIsProfileMuted } from '@/hooks/useIsProfileMuted.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { getPollIdFromLink } from '@/services/getPostLinks.js';

interface PostBodyProps {
    post: Post;
    isQuote?: boolean;
    isReply?: boolean;
    isDetail?: boolean;
    isComment?: boolean;
    showMore?: boolean;
    disablePadding?: boolean;
    showTranslate?: boolean;
}

const overrideComponents = {
    a: function Anchor({ title }: HTMLProps<HTMLAnchorElement>) {
        return <span>{title && isValidUrl(title) ? formatUrl(title, 30) : title}</span>;
    },
};

export const PostBody = forwardRef<HTMLDivElement, PostBodyProps>(function PostBody(
    {
        post,
        isQuote = false,
        isReply = false,
        isDetail = false,
        showMore = !isDetail,
        disablePadding = false,
        showTranslate = false,
    },
    ref,
) {
    const router = useRouter();
    const { metadata, author } = post;
    const canShowMore = !!(metadata.content?.content && metadata.content.content.length > 450) && showMore;

    const [postContent, setPostContent] = useState(metadata.content?.content ?? '');
    const [seen, seenRef] = useEverSeen({ rootMargin: '300px 0px' });
    const mergedRef = useForkRef(ref, seenRef);

    const { value: payloads } = useAsync(async () => {
        // decode the image upon post viewing, to reduce unnecessary load of images
        if (!seen) return;

        // mask web components are disabled
        if (env.external.NEXT_PUBLIC_MASK_WEB_COMPONENTS === STATUS.Disabled) return;

        return {
            payloadFromText: getEncryptedPayloadFromText(post),
            payloadFromImageAttachment: await getEncryptedPayloadFromImageAttachment(post),
        };
    }, [post, seen]);

    const muted = useIsProfileMuted(author, isDetail);

    const isSmall = useIsSmall('max');

    const pathname = usePathname();
    const isProfilePage = pathname === PageRoute.Profile || isRoutePathname(pathname, PageRoute.Profile);

    const payloadFromImageAttachment = payloads?.payloadFromImageAttachment;
    const payloadImageUrl = payloadFromImageAttachment?.[2];
    const hasEncryptedPayload = payloads?.payloadFromImageAttachment || payloads?.payloadFromText;

    // if payload image attachment is available, we don't need to show the attachments
    const attachments = metadata.content?.attachments ?? EMPTY_LIST;
    const availableAttachments = useMemo(() => {
        if (!payloadImageUrl) return attachments;
        return attachments.filter((x) => x.uri !== payloadImageUrl);
    }, [attachments, payloadImageUrl]);

    const showAttachments = availableAttachments.length > 0 || !!metadata.content?.asset;

    const noLeftPadding = isDetail || isSmall || disablePadding;

    const oembedUrl = resolveOembedUrl(post);
    const pollId = oembedUrl ? getPollIdFromLink(oembedUrl) : undefined;

    if (post.isEncrypted) {
        return (
            <div
                className={classNames({
                    '-mt-3 pl-[52px]': !noLeftPadding,
                    'my-2': !isQuote,
                })}
                ref={ref}
            >
                <div
                    className={classNames(
                        'flex items-center gap-1 rounded-lg border-primaryMain px-3 py-[6px] text-medium',
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

    if (post.isHidden || (muted && !isProfilePage)) {
        return (
            <CollapsedContent
                className={classNames({
                    ['-mt-3 pl-[52px]']: !noLeftPadding,
                    'my-2': !isQuote,
                })}
                ref={ref}
                authorMuted={muted}
                isQuote={isQuote}
            />
        );
    }

    if (isQuote) {
        return (
            <div className="my-2 flex items-center space-x-2 break-words text-base text-main">
                <NakedMarkup
                    post={post}
                    className={classNames(
                        'linkify single-post line-clamp-5 w-full self-stretch break-words text-left text-medium opacity-75',
                        {
                            'max-h-[7.8rem]': IS_SAFARI && IS_APPLE,
                        },
                    )}
                >
                    {metadata.content?.content}
                </NakedMarkup>
                {showAttachments ? (
                    <Attachments
                        post={post}
                        attachments={availableAttachments}
                        isQuote={!!metadata.content?.content?.length}
                    />
                ) : null}
            </div>
        );
    }

    if (isReply) {
        return (
            <div>
                <NakedMarkup
                    post={post}
                    className={classNames(
                        'single-post line-clamp-3 w-full self-stretch break-words text-base text-main',
                        {
                            'max-h-[7.8rem]': IS_SAFARI && IS_APPLE,
                        },
                    )}
                    components={overrideComponents}
                >
                    {post.metadata.content?.content}
                </NakedMarkup>
                <div className="flex flex-col text-base text-main">
                    {post.metadata.content?.asset?.type ? (
                        <Select
                            value={post.metadata.content.asset.type}
                            _Image="[Image]"
                            _Video="[Video]"
                            _Audio="[Audio]"
                            _Poll="[Poll]"
                            other=""
                        />
                    ) : null}
                    {post.quoteOn ? <span>{t`[Quote]`}</span> : null}
                </div>
            </div>
        );
    }

    return (
        <article
            className={classNames('mb-1.5 break-words text-base text-main', {
                '-mt-2 pl-[52px]': !noLeftPadding,
                'mt-1.5': noLeftPadding,
            })}
            ref={mergedRef}
        >
            <PostMarkup post={post} canShowMore={canShowMore} content={postContent} />

            {post.metadata.article ? (
                <Link href={resolvePostArticleUrl(post)} target="_blank" onClick={(e) => e.stopPropagation()}>
                    <TwitterArticleBody {...post.metadata.article} />
                </Link>
            ) : null}

            {showTranslate && trimify(postContent) ? (
                <ContentTranslator content={trimify(postContent)} canShowMore={canShowMore} post={post} />
            ) : null}

            {seen && hasEncryptedPayload ? (
                <mask-decrypted-post
                    props={encodeURIComponent(
                        JSON.stringify({
                            post,
                            payloads: compact([payloads.payloadFromImageAttachment, payloads.payloadFromText]),
                        }),
                    )}
                />
            ) : null}

            {canShowMore ? (
                <div className="text-medium font-bold text-lightHighlight">
                    <div
                        onClick={() => {
                            router.push(getPostUrl(post));
                        }}
                    >
                        <Trans>Show More</Trans>
                    </div>
                </div>
            ) : null}

            {/* Poll */}
            {!hasEncryptedPayload ? (
                pollId && oembedUrl ? (
                    <FramePoll post={post} pollId={pollId} frameUrl={oembedUrl} />
                ) : post.poll ? (
                    <PollCard post={post} frameUrl={''} />
                ) : null
            ) : null}

            {showAttachments ? (
                <Attachments post={post} attachments={availableAttachments} isDetail={isDetail} />
            ) : null}

            {!hasEncryptedPayload && !pollId ? <PostLinks post={post} setContent={setPostContent} /> : null}

            {post.source === Source.Twitter ? <TweetSpace post={post} /> : null}

            {!!post.quoteOn && !isQuote ? <Quote post={post.quoteOn} /> : null}
        </article>
    );
});
