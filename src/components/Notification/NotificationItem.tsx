'use client';

import { Plural, Select, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { motion } from 'framer-motion';
import { first, uniqBy } from 'lodash-es';
import { memo, useMemo } from 'react';

import { PostActions } from '@/components/Actions/index.js';
import { MoreAction } from '@/components/Actions/More.js';
import { AvatarGroup } from '@/components/AvatarGroup.js';
import { Markup } from '@/components/Markup/Markup.js';
import { ExtraProfiles } from '@/components/Notification/ExtraProfiles.js';
import { ProfileLink } from '@/components/Notification/ProfileLink.js';
import { CollapsedContent } from '@/components/Posts/CollapsedContent.js';
import { Quote } from '@/components/Posts/Quote.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { Link } from '@/esm/Link.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { resolveNotificationIcon } from '@/helpers/resolveNotificationIcon.js';
import { isProfileMuted } from '@/hooks/useIsProfileMuted.js';
import { type Notification, NotificationType } from '@/providers/types/SocialMedia.js';

interface NotificationItemProps {
    notification: Notification;
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
                return uniqBy(notification.mirrors, (x) => x.profileId);
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
                            other={<ExtraProfiles profiles={notification.reactors} />}
                        />{' '}
                        <span>liked your </span>
                        <strong>
                            <Select
                                value={notification.post.type}
                                _Post="post"
                                _Comment="comment"
                                _Quote="quote"
                                _Mirror="mirror"
                                other="post"
                            />
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
                            <Select
                                value={notification.quote.quoteOn.type}
                                _Post="post"
                                _Comment="comment"
                                _Quote="quote"
                                _Mirror="mirror"
                                other="post"
                            />
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
                            other={<ExtraProfiles profiles={notification.followers} />}
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
                            <Select
                                value={notification.comment.commentOn.type}
                                _Post="post"
                                _Comment="comment"
                                _Quote="quote"
                                _Mirror="mirror"
                                other="post"
                            />
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
                            <Select
                                value={notification.post.type}
                                _Post="post"
                                _Comment="comment"
                                _Quote="quote"
                                _Mirror="mirror"
                                other="post"
                            />
                        </strong>
                    </Trans>
                );
            case NotificationType.Mirror:
                // It's allow to mirror multiple times.
                const mirrors = uniqBy(notification.mirrors, (x) => x.profileId);
                const firstMirror = first(mirrors);
                if (!firstMirror || !notification.post?.type) return;
                return (
                    <Trans>
                        <Plural
                            value={mirrors.length}
                            offset={1}
                            _1={<ProfileLink profile={firstMirror} />}
                            _2={
                                <Trans>
                                    <ProfileLink profile={firstMirror} /> and <ProfileLink profile={mirrors[1]} />
                                </Trans>
                            }
                            other={<ExtraProfiles profiles={mirrors} />}
                        />{' '}
                        <Select
                            value={notification.source}
                            _Lens="mirrored your"
                            _Farcaster="recasted your"
                            other="mirrored your"
                        />{' '}
                        <strong>
                            <Select
                                value={notification.post.type}
                                _Post="post"
                                _Comment="comment"
                                _Quote="quote"
                                _Mirror="mirror"
                                other="post"
                            />
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
                            other={<ExtraProfiles profiles={notification.actions} />}
                        />{' '}
                        <span>collected your </span>
                        <strong>
                            <Select
                                value={notification.post.type}
                                _Post="post"
                                _Comment="comment"
                                _Quote="quote"
                                _Mirror="mirror"
                                other="post"
                            />
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
                if (isProfileMuted(notification.post.author)) return <CollapsedContent authorMuted isQuote={false} />;
                return <Quote className="bg-bg" post={notification.post} />;
            case NotificationType.Comment:
            case NotificationType.Mention:
                const post = notification.type === NotificationType.Comment ? notification.comment : notification.post;
                if (!post) return;
                const postLink = getPostUrl(post);
                if (isProfileMuted(post.author)) return <CollapsedContent authorMuted isQuote={false} />;
                return (
                    <Link className="mt-1" href={postLink}>
                        <Markup post={post} className="markup linkify line-clamp-5 break-words text-medium">
                            {post.metadata.content?.content || ''}
                        </Markup>
                    </Link>
                );
            case NotificationType.Quote:
                if (isProfileMuted(notification.post.author)) {
                    return <CollapsedContent authorMuted isQuote={false} />;
                }
                return (
                    <div className="mt-1">
                        <Markup
                            post={notification.quote}
                            className="markup linkify line-clamp-5 break-words text-medium"
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
                if (!notification.comment || isProfileMuted(notification.comment.author)) return null;
                return <PostActions post={notification.comment} disablePadding />;
            case NotificationType.Mention:
                if (!notification.post || isProfileMuted(notification.post.author)) return null;
                return <PostActions post={notification.post} disablePadding />;
            case NotificationType.Quote:
                if (isProfileMuted(notification.quote.author)) return null;
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
                        post={notification.comment}
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
                        post={notification.post}
                    />
                );
            case NotificationType.Follow:
                if (notification.followers.length > 1) return null;
                const follower = first(notification.followers);
                if (!follower) return null;
                return <MoreAction source={notification.source} author={follower} />;
            case NotificationType.Mirror:
                const mirrors = uniqBy(notification.mirrors, (x) => x.profileId);
                if (mirrors.length > 1) return null;
                const reporter = first(mirrors);
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
                <div className="flex max-w-full flex-1 items-start gap-4">
                    <div className="flex h-10 items-center">
                        {Icon ? <Icon className="text-secondary" width={24} height={24} /> : null}
                    </div>
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
                        <div className="mt-2 flex min-w-0 items-center gap-[0.2em] whitespace-nowrap text-medium">
                            {title}
                        </div>
                        {content}
                        {actions}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});
