'use client';

import { Plural, Select, t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { createLookupTableResolver } from '@masknet/shared-base';
import { motion } from 'framer-motion';
import { first } from 'lodash-es';
import { type FunctionComponent, memo, type SVGAttributes, useMemo } from 'react';

import CollectIcon from '@/assets/collect-large.svg';
import FollowIcon from '@/assets/follow.svg';
import LikeIcon from '@/assets/like-large.svg';
import MessageIcon from '@/assets/messages.svg';
import MirrorIcon from '@/assets/mirror-large.svg';
import { PostActions } from '@/components/Actions/index.js';
import { MoreAction } from '@/components/Actions/More.js';
import { AvatarGroup } from '@/components/AvatarGroup.js';
import { Markup } from '@/components/Markup/Markup.js';
import { ProfileLink } from '@/components/Notification/ProfileLink.js';
import { CollapsedContent } from '@/components/Posts/CollapsedContent.js';
import { Quote } from '@/components/Posts/Quote.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { Link } from '@/esm/Link.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { getIsMuted } from '@/hooks/useIsMuted.js';
import { type Notification, NotificationType, type PostType } from '@/providers/types/SocialMedia.js';

const resolveNotificationIcon = createLookupTableResolver<
    NotificationType,
    FunctionComponent<SVGAttributes<SVGElement>> | null
>(
    {
        [NotificationType.Reaction]: LikeIcon,
        [NotificationType.Act]: CollectIcon,
        [NotificationType.Comment]: MessageIcon,
        [NotificationType.Mirror]: MirrorIcon,
        [NotificationType.Quote]: MirrorIcon,
        [NotificationType.Follow]: FollowIcon,
        [NotificationType.Mention]: MessageIcon,
    },
    null,
);

export interface NotificationItemProps {
    notification: Notification;
}

function PostTypeI18N({ type }: { type: PostType }) {
    switch (type) {
        case 'Post':
            return <Trans>post</Trans>;
        case 'Comment':
            return <Trans>comment</Trans>;
        case 'Quote':
            return <Trans>quote</Trans>;
        case 'Mirror':
            return <Trans>mirror</Trans>;
        default:
            safeUnreachable(type);
            return null;
    }
}

export const NotificationItem = memo<NotificationItemProps>(function NotificationItem({ notification }) {
    const Icon = resolveNotificationIcon(notification.type);

    const profiles = useMemo(() => {
        const type = notification.type;
        switch (type) {
            case NotificationType.Reaction:
                return notification.reactors;
            case NotificationType.Quote:
                return [notification.quote.author];
            case NotificationType.Follow:
                return notification.followers;
            case NotificationType.Comment:
                return notification.comment ? [notification.comment.author] : undefined;
            case NotificationType.Mention:
                return notification.post ? [notification.post.author] : undefined;
            case NotificationType.Mirror:
                return notification.mirrors;
            case NotificationType.Act:
                return notification.actions;
            default:
                safeUnreachable(type);
                return;
        }
    }, [notification]);

    const title = useMemo(() => {
        const type = notification.type;
        switch (type) {
            case NotificationType.Reaction:
                const firstReactor = first(notification.reactors);
                if (!firstReactor || !notification.post?.type) return;

                return (
                    <Trans>
                        <Plural
                            value={notification.reactors.length}
                            offset={1}
                            _1={<ProfileLink profile={firstReactor} />}
                            _2={
                                <Trans>
                                    <ProfileLink profile={firstReactor} /> and{' '}
                                    <ProfileLink profile={notification.reactors[1]} />
                                </Trans>
                            }
                            other={
                                <Trans>
                                    <ProfileLink profile={firstReactor} /> and # others
                                </Trans>
                            }
                        />{' '}
                        <span>liked your </span>
                        <strong>
                            <PostTypeI18N type={notification.post.type} />
                        </strong>
                    </Trans>
                );
            case NotificationType.Quote:
                const by = notification.quote.author;
                if (!notification.quote.quoteOn?.type) return;
                return (
                    <Trans>
                        <ProfileLink profile={by} /> quoted your{' '}
                        <strong>
                            <PostTypeI18N type={notification.quote.quoteOn.type} />
                        </strong>
                    </Trans>
                );
            case NotificationType.Follow:
                const firstFollower = first(notification.followers);
                if (!firstFollower) return;

                return (
                    <Trans>
                        <Plural
                            value={notification.followers.length}
                            offset={1}
                            _1={<ProfileLink profile={firstFollower} />}
                            _2={
                                <Trans>
                                    <ProfileLink profile={firstFollower} /> and{' '}
                                    <ProfileLink profile={notification.followers[1]} />
                                </Trans>
                            }
                            other={
                                <Trans>
                                    <ProfileLink profile={firstFollower} /> and # others
                                </Trans>
                            }
                        />
                        <span> followed you</span>
                    </Trans>
                );
            case NotificationType.Comment:
                if (!notification.comment?.commentOn?.type) return;
                const author = notification.comment.author;
                return (
                    <Trans>
                        <ProfileLink profile={author} /> commented on your{' '}
                        <strong>
                            <PostTypeI18N type={notification.comment.commentOn.type} />
                        </strong>
                    </Trans>
                );
            case NotificationType.Mention:
                if (!notification.post?.type) return;
                const mentionAuthor = notification.post.author;
                return (
                    <Trans>
                        <ProfileLink profile={mentionAuthor} /> mentioned you in a{' '}
                        <strong>
                            <PostTypeI18N type={notification.post.type} />
                        </strong>
                    </Trans>
                );
            case NotificationType.Mirror:
                const firstMirror = first(notification.mirrors);
                if (!firstMirror || !notification.post?.type) return;
                return (
                    <Trans>
                        <Plural
                            value={notification.mirrors.length}
                            offset={1}
                            _1={<ProfileLink profile={firstMirror} />}
                            _2={
                                <Trans>
                                    <ProfileLink profile={firstMirror} /> and{' '}
                                    <ProfileLink profile={notification.mirrors[1]} />
                                </Trans>
                            }
                            other={
                                <Trans>
                                    <ProfileLink profile={firstMirror} />
                                    <ProfileLink profile={firstMirror} /> and # others
                                </Trans>
                            }
                        />{' '}
                        <Select
                            value={notification.source}
                            _Lens={t`mirrored your`}
                            _Farcaster={t`recasted your`}
                            other={t`mirrored your`}
                        />{' '}
                        <strong>
                            <PostTypeI18N type={notification.post.type} />
                        </strong>
                    </Trans>
                );
            case NotificationType.Act:
                const firstActed = first(notification.actions);
                if (!firstActed || !notification.post.type) return;
                return (
                    <Trans>
                        <Plural
                            value={notification.actions.length}
                            offset={1}
                            _1={<ProfileLink profile={firstActed} />}
                            _2={
                                <Trans>
                                    <ProfileLink profile={firstActed} /> and{' '}
                                    <ProfileLink profile={notification.actions[1]} />
                                </Trans>
                            }
                            other={
                                <Trans>
                                    <ProfileLink profile={firstActed} />
                                    <ProfileLink profile={firstActed} /> and # others
                                </Trans>
                            }
                        />{' '}
                        <span>acted on your </span>
                        <strong>
                            <PostTypeI18N type={notification.post.type} />
                        </strong>
                    </Trans>
                );
            default:
                safeUnreachable(type);
                return null;
        }
    }, [notification]);

    const content = useMemo(() => {
        const type = notification.type;
        switch (type) {
            case NotificationType.Reaction:
            case NotificationType.Mirror:
            case NotificationType.Act:
                if (!notification.post) return;
                if (getIsMuted(notification.post.author))
                    return <CollapsedContent authorMuted disableIndent isQuote={false} />;
                return <Quote className="bg-bg" post={notification.post} />;
            case NotificationType.Comment:
            case NotificationType.Mention:
                const post = notification.type === NotificationType.Comment ? notification.comment : notification.post;
                if (!post) return;
                const postLink = getPostUrl(post);
                if (getIsMuted(post.author)) return <CollapsedContent authorMuted disableIndent isQuote={false} />;
                return (
                    <Link className="mt-1" href={postLink}>
                        <Markup post={post} className="markup linkify line-clamp-5 break-words text-[15px]">
                            {post.metadata.content?.content || ''}
                        </Markup>
                    </Link>
                );
            case NotificationType.Quote:
                if (getIsMuted(notification.post.author)) {
                    return <CollapsedContent authorMuted disableIndent isQuote={false} />;
                }
                return (
                    <div className="mt-1">
                        <Markup
                            post={notification.quote}
                            className="markup linkify line-clamp-5 break-words text-[15px]"
                        >
                            {notification.quote.metadata.content?.content || ''}
                        </Markup>
                        <Quote className="bg-bg" post={notification.post} />
                    </div>
                );
            case NotificationType.Follow:
                return null;
            default:
                safeUnreachable(type);
                return null;
        }
    }, [notification]);

    const actions = useMemo(() => {
        const type = notification.type;
        switch (type) {
            case NotificationType.Comment:
                if (!notification.comment || getIsMuted(notification.comment.author)) return null;
                return <PostActions post={notification.comment} disablePadding />;
            case NotificationType.Mention:
                if (!notification.post || getIsMuted(notification.post.author)) return null;
                return <PostActions post={notification.post} disablePadding />;
            case NotificationType.Quote:
                if (getIsMuted(notification.quote.author)) return null;
                return <PostActions post={notification.quote} disablePadding />;
            case NotificationType.Act:
                return null;
            case NotificationType.Follow:
                return null;
            case NotificationType.Mirror:
                return null;
            case NotificationType.Reaction:
                return null;
            default:
                safeUnreachable(type);
                return null;
        }
    }, [notification]);

    const moreAction = useMemo(() => {
        const type = notification.type;
        switch (type) {
            case NotificationType.Comment:
                if (!notification.comment) return null;
                return (
                    <MoreAction
                        source={notification.source}
                        author={notification.comment.author}
                        id={notification.comment.postId}
                    />
                );
            case NotificationType.Mention:
            case NotificationType.Quote:
            case NotificationType.Act:
                if (!notification.post) return null;
                return (
                    <MoreAction
                        source={notification.post.source}
                        author={notification.post.author}
                        id={notification.post.postId}
                    />
                );
            case NotificationType.Follow:
                if (notification.followers.length > 1) return null;
                const follower = first(notification.followers);
                if (!follower) return null;
                return <MoreAction source={notification.source} author={follower} />;
            case NotificationType.Mirror:
                if (notification.mirrors.length > 1) return null;
                const reporter = first(notification.mirrors);
                if (!reporter) return null;
                return <MoreAction source={notification.source} author={reporter} />;
            case NotificationType.Reaction:
                if (notification.reactors.length > 1) return null;
                const reactor = first(notification.reactors);
                if (!reactor) return null;
                return <MoreAction source={notification.source} author={reactor} />;
            default:
                safeUnreachable(type);
                return null;
        }
    }, [notification]);

    if (!profiles) return;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-b border-secondaryLine px-4 py-3 hover:bg-bg dark:border-line"
        >
            <div className="flex justify-between">
                <div className="flex max-w-full flex-1 items-start space-x-4">
                    {Icon ? <Icon className="text-secondary" width={24} height={24} /> : null}
                    <div className="max-w-[calc(100%-40px)] flex-1">
                        <div className="flex flex-1 items-center justify-between">
                            <AvatarGroup profiles={profiles.slice(0, 5)} />
                            <div className="flex items-center space-x-2">
                                <SocialSourceIcon source={notification.source} />
                                {notification.timestamp ? (
                                    <span className="text-xs leading-4 text-secondary">
                                        <TimestampFormatter time={notification.timestamp} />
                                    </span>
                                ) : null}
                                {moreAction}
                            </div>
                        </div>
                        <div className="mt-2 text-[15px]">{title}</div>
                        {content}
                        {actions}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});
