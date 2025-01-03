'use client';

import { Select, t, Trans } from '@lingui/macro';
import { useForkRef } from '@mui/material';
import { compact } from 'lodash-es';
import { usePathname, useRouter } from 'next/navigation.js';
import { forwardRef, type HTMLProps, useMemo, useState } from 'react';
import { useAsync } from 'react-use';

import { TwitterArticleBody } from '@/components/Article/TwitterArticleBody.js';
import { Link } from '@/components/Link.js';
import { NakedMarkup } from '@/components/Markup/NakedMarkup.js';
import { PostMarkup } from '@/components/Markup/PostMarkup.js';
import { FramePoll } from '@/components/Poll/FramePoll.js';
import { PollCard } from '@/components/Poll/PollCard.js';
import { Attachments } from '@/components/Posts/Attachment.js';
import { CollapsedContent } from '@/components/Posts/CollapsedContent.js';
import { ContentTranslator } from '@/components/Posts/ContentTranslator.js';
import { PostLinks } from '@/components/Posts/PostLinks.js';
import { Quote } from '@/components/Posts/Quote.js';
import { RedPacketInspector } from '@/components/RedPacket/RedPacketInspector.js';
import { IS_APPLE, IS_SAFARI } from '@/constants/bowser.js';
import { PageRoute, Source } from '@/constants/enum.js';
import { EMPTY_LIST, RP_HASH_TAG } from '@/constants/index.js';
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
import { useTwitterStateStore } from '@/store/useProfileStore.js';

export interface PostBodyContentProps {
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

function canSkipWaitingForPayload(post: Post) {
    const content = post.metadata.content?.content;

    return !(content?.includes(RP_HASH_TAG) || !!getEncryptedPayloadFromText(content));
}

export const PostBodyContent = forwardRef<HTMLDivElement, PostBodyContentProps>(function PostBodyContent(props, ref) {
    const {
        post,
        isQuote = false,
        isReply = false,
        isDetail = false,
        showMore = !isDetail,
        disablePadding = false,
        showTranslate = false,
    } = props;

    const router = useRouter();
    const currentTwitterProfileSession = useTwitterStateStore.use.currentProfileSession();
    const { metadata, author } = post;
    const postRawContent = metadata.content?.content;
    // ! liteRawContent is used for reply and quote, only shows the first 2000 characters, because the text is foldable
    const liteRawContent = metadata.content?.content?.slice(0, 2000);
    const canShowMore = !!(postRawContent && postRawContent.length > 450) && showMore;

    const [postContent, setPostContent] = useState(postRawContent ?? '');
    const [seen, seenRef] = useEverSeen({ rootMargin: '300px 0px' });
    const mergedRef = useForkRef(ref, seenRef);

    const attachments = metadata.content?.attachments ?? EMPTY_LIST;
    const { value: payloads, loading: decodingImage } = useAsync(async () => {
        // decode the image upon post viewing, to reduce unnecessary load of images
        if (!seen) return;

        return {
            payloadFromText: getEncryptedPayloadFromText(postRawContent),
            payloadFromImageAttachment: await getEncryptedPayloadFromImageAttachment(attachments),
        };
    }, [postRawContent, attachments, seen]);

    const muted = useIsProfileMuted(author.source, author.profileId, author.viewerContext?.blocking, isDetail);

    const isSmall = useIsSmall('max');

    const pathname = usePathname();
    const isProfilePage = pathname === PageRoute.Profile || isRoutePathname(pathname, PageRoute.Profile);

    const payloadFromImageAttachment = payloads?.payloadFromImageAttachment;
    const payloadImageUrl = payloadFromImageAttachment?.[2];
    const hasEncryptedPayload = payloads?.payloadFromImageAttachment || payloads?.payloadFromText;

    // if payload image attachment is available, we don't need to show the attachments
    const availableAttachments = useMemo(() => {
        if (!payloadImageUrl) return attachments;
        return attachments.filter((x) => x.uri !== payloadImageUrl);
    }, [attachments, payloadImageUrl]);

    const showAttachments =
        (availableAttachments.length > 0 || !!metadata.content?.asset) &&
        (!decodingImage || canSkipWaitingForPayload(post));

    const noLeftPadding = isDetail || isSmall || disablePadding;

    const oembedUrl = resolveOembedUrl(post);
    const pollId = oembedUrl ? getPollIdFromLink(oembedUrl) : undefined;

    const EncryptedContent = useMemo(() => {
        if (post.source === Source.Twitter && !currentTwitterProfileSession) return null;

        if (seen && hasEncryptedPayload) {
            return <RedPacketInspector post={post} payloads={compact(Object.values(payloads))} />;
        }

        return null;
    }, [post, currentTwitterProfileSession, seen, hasEncryptedPayload, payloads]);

    const LinksContent = useMemo(
        () =>
            !hasEncryptedPayload && !decodingImage && !pollId ? (
                <PostLinks post={post} setContent={setPostContent} />
            ) : null,
        [hasEncryptedPayload, decodingImage, pollId, post, setPostContent],
    );

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
            <div className="my-2 break-words text-base text-main">
                <NakedMarkup
                    post={post}
                    className={classNames(
                        'linkify line-clamp-5 w-full self-stretch break-words text-left text-medium opacity-75',
                        {
                            'max-h-[7.8rem]': IS_SAFARI && IS_APPLE,
                        },
                    )}
                >
                    {liteRawContent}
                </NakedMarkup>
                {EncryptedContent}
                {showAttachments ? (
                    <Attachments
                        post={post}
                        attachments={availableAttachments}
                        isQuote={!!metadata.content?.content?.length}
                    />
                ) : null}
                {LinksContent}
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
                    {liteRawContent}
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

            {EncryptedContent}

            {canShowMore ? (
                <div className="text-medium font-bold text-highlight">
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
            {!hasEncryptedPayload && !decodingImage ? (
                pollId && oembedUrl ? (
                    <FramePoll post={post} pollId={pollId} frameUrl={oembedUrl} />
                ) : post.poll ? (
                    <PollCard post={post} frameUrl={''} />
                ) : null
            ) : null}

            {showAttachments ? (
                <Attachments post={post} attachments={availableAttachments} isDetail={isDetail} />
            ) : null}

            {LinksContent}

            {!!post.quoteOn && !isQuote ? <Quote post={post.quoteOn} /> : null}
        </article>
    );
});
