'use client';

import { Select, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { motion } from 'framer-motion';
import { first, uniqBy } from 'lodash-es';
import { type FunctionComponent, memo, type SVGAttributes, useMemo } from 'react';

import CollectIcon from '@/assets/collect-large.svg';
import FollowIcon from '@/assets/follow.svg';
import LikeIcon from '@/assets/like-large.svg';
import MessagesIcon from '@/assets/messages.svg';
import MirrorIcon from '@/assets/mirror-large.svg';
import { PostActions } from '@/components/Actions/index.js';
import { MoreAction } from '@/components/Actions/More.js';
import { AvatarGroup } from '@/components/AvatarGroup.js';
import { Markup } from '@/components/Markup/Markup.js';
import { ProfileLink } from '@/components/Notification/ProfileLink.js';
import { UserListTippy } from '@/components/Notification/UserListTippy.js';
import { CollapsedContent } from '@/components/Posts/CollapsedContent.js';
import { Quote } from '@/components/Posts/Quote.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { Link } from '@/esm/Link.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { isProfileMuted } from '@/hooks/useIsProfileMuted.js';
import { type Notification, NotificationType } from '@/providers/types/SocialMedia.js';

export const resolveNotificationIcon = createLookupTableResolver<
    NotificationType,
    FunctionComponent<SVGAttributes<SVGElement>> | null
>(
    {
        [NotificationType.Reaction]: LikeIcon,
        [NotificationType.Act]: CollectIcon,
        [NotificationType.Comment]: MessagesIcon,
        [NotificationType.Mirror]: MirrorIcon,
        [NotificationType.Quote]: MirrorIcon,
        [NotificationType.Follow]: FollowIcon,
        [NotificationType.Mention]: MessagesIcon,
    },
    null,
);

export interface NotificationItemProps {
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

    // We flatten i18n plur into multiple statements to produce friendly translation templates
    const title = useMemo(() => {
        const type = notification.type;
        switch (type) {
            case NotificationType.Reaction: {
                const firstReactor = first(notification.reactors);
                if (!firstReactor || !notification.post?.type) return;
                const reactors = notification.reactors;
                const length = reactors.length;

                if (length === 1)
                    return (
                        <Trans>
                            <ProfileLink profile={firstReactor} /> <span>liked your </span>
                            <strong>
                                <Select value={type} _Post="post" _Comment="comment" _Mirror="mirror" other="post" />
                            </strong>
                        </Trans>
                    );

                if (length === 2)
                    return (
                        <Trans>
                            <ProfileLink profile={firstReactor} /> and{' '}
                            <ProfileLink profile={notification.reactors[1]} /> <span>liked your </span>
                            <strong>
                                <Select value={type} _Post="post" _Comment="comment" _Mirror="mirror" other="post" />
                            </strong>
                        </Trans>
                    );

                return (
                    <Trans>
                        <ProfileLink profile={firstReactor} /> and{' '}
                        <UserListTippy
                            users={reactors.slice(1)}
                            className="cursor-pointer underline hover:underline md:no-underline"
                        >
                            {length - 1} others
                        </UserListTippy>{' '}
                        <span>liked your </span>
                        <strong>
                            <Select value={type} _Post="post" _Comment="comment" _Mirror="mirror" other="post" />
                        </strong>
                    </Trans>
                );
            }
            case NotificationType.Quote: {
                const by = notification.quote.author;
                const type = notification.quote.quoteOn?.type;
                if (!type) return;
                return (
                    <Trans>
                        <ProfileLink profile={by} /> quoted your{' '}
                        <strong>
                            <Select value={type} _Post="post" _Comment="comment" _Mirror="mirror" other="post" />
                        </strong>
                    </Trans>
                );
            }
            case NotificationType.Follow:
                const firstFollower = first(notification.followers);
                if (!firstFollower) return;
                const followers = notification.followers;
                const length = followers.length;

                if (length === 1)
                    <Trans>
                        <ProfileLink profile={firstFollower} />
                        <span> followed you</span>
                    </Trans>;

                if (length === 2)
                    return (
                        <Trans>
                            <ProfileLink profile={firstFollower} /> and{' '}
                            <ProfileLink profile={notification.followers[1]} />
                            <span> followed you</span>
                        </Trans>
                    );

                return (
                    <Trans>
                        <ProfileLink profile={firstFollower} /> and{' '}
                        <UserListTippy
                            users={followers.slice(1)}
                            className="cursor-pointer underline hover:underline md:no-underline"
                        >
                            {length - 1} others
                        </UserListTippy>
                        <span> followed you</span>
                    </Trans>
                );
            case NotificationType.Comment: {
                if (!notification.comment?.commentOn?.type) return;
                const type = notification.comment.commentOn.type;
                const author = notification.comment.author;
                return (
                    <Trans>
                        <ProfileLink profile={author} /> commented on your{' '}
                        <strong>
                            <Select value={type} _Post="post" _Comment="comment" _Mirror="mirror" other="post" />
                        </strong>
                    </Trans>
                );
            }
            case NotificationType.Mention: {
                if (!notification.post?.type) return;
                const type = notification.post?.type;
                const mentionAuthor = notification.post.author;
                return (
                    <Trans>
                        <ProfileLink profile={mentionAuthor} /> mentioned you in a{' '}
                        <strong>
                            <Select value={type} _Post="post" _Comment="comment" _Mirror="mirror" other="post" />
                        </strong>
                    </Trans>
                );
            }
            case NotificationType.Mirror: {
                // It's allow to mirror multiple times.
                const mirrors = uniqBy(notification.mirrors, (x) => x.profileId);
                const firstMirror = first(mirrors);
                const type = notification.post?.type;
                if (!firstMirror || !type) return;
                const length = mirrors.length;
                if (length === 1)
                    return (
                        <Trans>
                            <ProfileLink profile={firstMirror} />{' '}
                            <Select
                                comment="mirror-action"
                                value={notification.source}
                                _Lens="mirrored your"
                                _Farcaster="recasted your"
                                other="mirrored your"
                            />{' '}
                            <strong>
                                <Select value={type} _Post="post" _Comment="comment" _Mirror="mirror" other="post" />
                            </strong>
                        </Trans>
                    );

                if (length === 2)
                    return (
                        <Trans>
                            <ProfileLink profile={firstMirror} /> and <ProfileLink profile={mirrors[1]} />{' '}
                            <Select
                                value={notification.source}
                                _Lens="mirrored your"
                                _Farcaster="recasted your"
                                other="mirrored your"
                            />{' '}
                            <strong>
                                <Select value={type} _Post="post" _Comment="comment" _Mirror="mirror" other="post" />
                            </strong>
                        </Trans>
                    );

                return (
                    <Trans>
                        <ProfileLink profile={firstMirror} /> and{' '}
                        <UserListTippy
                            users={mirrors.slice(1)}
                            className="cursor-pointer underline hover:underline md:no-underline"
                        >
                            {length - 1} others
                        </UserListTippy>{' '}
                        <Select
                            value={notification.source}
                            _Lens="mirrored your"
                            _Farcaster="recasted your"
                            other="mirrored your"
                        />{' '}
                        <strong>
                            <Select value={type} _Post="post" _Comment="comment" _Mirror="mirror" other="post" />
                        </strong>
                    </Trans>
                );
            }
            case NotificationType.Act: {
                const firstActed = first(notification.actions);
                const type = notification.post.type;
                if (!firstActed || !type) return;
                const actions = notification.actions;
                const length = notification.actions.length;
                if (length === 1)
                    return (
                        <Trans>
                            <ProfileLink profile={firstActed} /> <span>acted on your </span>
                            <strong>
                                <Select value={type} _Post="post" _Comment="comment" _Mirror="mirror" other="post" />
                            </strong>
                        </Trans>
                    );
                if (length === 2)
                    return (
                        <Trans>
                            <ProfileLink profile={firstActed} /> and <ProfileLink profile={notification.actions[1]} />{' '}
                            <span>acted on your </span>
                            <strong>
                                <Select value={type} _Post="post" _Comment="comment" _Mirror="mirror" other="post" />
                            </strong>
                        </Trans>
                    );

                return (
                    <Trans>
                        <ProfileLink profile={firstActed} /> and{' '}
                        <UserListTippy
                            users={actions.slice(1)}
                            className="cursor-pointer underline hover:underline md:no-underline"
                        >
                            {length - 1} others
                        </UserListTippy>{' '}
                        <span>acted on your </span>
                        <strong>
                            <Select value={type} _Post="post" _Comment="comment" _Mirror="mirror" other="post" />
                        </strong>
                    </Trans>
                );
            }
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
                        <Markup post={post} className="markup linkify line-clamp-5 break-words text-[15px]">
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
                        <div className="mt-2 text-[15px]">{title}</div>
                        {content}
                        {actions}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});
