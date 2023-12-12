'use client';

import { Plural, Trans } from '@lingui/macro';
import { createLookupTableResolver } from '@masknet/shared-base';
import { motion } from 'framer-motion';
import { first } from 'lodash-es';
import { type FunctionComponent, memo, type SVGAttributes, useMemo } from 'react';

import CollectIcon from '@/assets/collect-large.svg';
import FollowIcon from '@/assets/follow.svg';
import LikeIcon from '@/assets/like-large.svg';
import MessageIcon from '@/assets/messages.svg';
import MirrorIcon from '@/assets/mirror-large.svg';
import More from '@/assets/more.svg';
import { PostActions } from '@/components/Actions/index.js';
import { Image } from '@/components/Image.js';
import { Markup } from '@/components/Markup/index.js';
import { Quote } from '@/components/Posts/Quote.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';
import { type Notification, NotificationType, type PostType } from '@/providers/types/SocialMedia.js';

import { ProfileLink } from './ProfileLink.js';

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
    if (type === 'Post') {
        return <Trans>post</Trans>;
    } else if (type === 'Comment') {
        return <Trans>comment</Trans>;
    } else if (type === 'Quote') {
        return <Trans>quote</Trans>;
    } else if (type === 'Mirror') {
        return <Trans>mirror</Trans>;
    }

    return;
}

export const NotificationItem = memo<NotificationItemProps>(function NotificationItem({ notification }) {
    const { isDarkMode } = useDarkMode();
    const Icon = resolveNotificationIcon(notification.type);

    const profiles = useMemo(() => {
        switch (notification.type) {
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
                return;
        }
    }, [notification]);

    const title = useMemo(() => {
        switch (notification.type) {
            case NotificationType.Reaction:
                const firstReactor = first(notification.reactors);
                if (!firstReactor || !notification.post?.type) return;

                return (
                    <Trans>
                        <Plural
                            value={notification.reactors.length}
                            one={<ProfileLink profile={firstReactor} />}
                            other={
                                <Plural
                                    value={notification.reactors.length - 1}
                                    one={
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
                                />
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
                            one={<ProfileLink profile={firstFollower} />}
                            other={
                                <Plural
                                    value={notification.followers.length - 1}
                                    one={
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
                            }
                        />{' '}
                        <span>followed you</span>
                    </Trans>
                );
            case NotificationType.Comment:
                if (!notification.comment?.commentOn?.type) return;
                const author = notification.comment.author;
                return (
                    <Trans>
                        <ProfileLink profile={author} /> commented your{' '}
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
                            one={<ProfileLink profile={firstMirror} />}
                            other={
                                <Plural
                                    value={notification.mirrors.length - 1}
                                    one={
                                        <Trans>
                                            <ProfileLink profile={firstMirror} /> and{' '}
                                            <ProfileLink profile={notification.mirrors[1]} />
                                        </Trans>
                                    }
                                    other={
                                        <Trans>
                                            <ProfileLink profile={firstMirror} /> and # others mirrored you
                                        </Trans>
                                    }
                                />
                            }
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
                            one={<ProfileLink profile={firstActed} />}
                            other={
                                <Plural
                                    value={notification.actions.length - 1}
                                    one={
                                        <Trans>
                                            <ProfileLink profile={firstActed} /> and{' '}
                                            <ProfileLink profile={notification.actions[1]} />
                                        </Trans>
                                    }
                                    other={
                                        <Trans>
                                            <ProfileLink profile={firstActed} /> and # others acted on your
                                        </Trans>
                                    }
                                />
                            }
                        />{' '}
                        <strong>
                            <PostTypeI18N type={notification.post.type} />
                        </strong>
                    </Trans>
                );
            default:
                return;
        }
    }, [notification]);

    const showMoreAction = useMemo(() => {
        return profiles && profiles.length <= 1 && notification.timestamp;
    }, [notification, profiles]);

    const content = useMemo(() => {
        switch (notification.type) {
            case NotificationType.Reaction:
            case NotificationType.Mirror:
            case NotificationType.Act:
                if (!notification.post) return;
                return <Quote className="bg-bg" post={notification.post} />;
            case NotificationType.Comment:
            case NotificationType.Mention:
                const post = notification.type === NotificationType.Comment ? notification.comment : notification.post;
                if (!post) return;
                return (
                    <div className="mt-1">
                        <Markup className="markup linkify text-md line-clamp-5 break-words">
                            {post.metadata.content?.content || ''}
                        </Markup>
                    </div>
                );
            case NotificationType.Quote:
                return (
                    <div className="mt-1">
                        <Markup className="markup linkify text-md line-clamp-5 break-words">
                            {notification.quote.metadata.content?.content || ''}
                        </Markup>
                        <Quote className="bg-bg" post={notification.post} />
                    </div>
                );
            default:
                return;
        }
    }, [notification]);

    const actions = useMemo(() => {
        switch (notification.type) {
            case NotificationType.Comment:
                if (!notification.comment) return;
                return <PostActions post={notification.comment} disablePadding />;
            case NotificationType.Mention:
                if (!notification.post) return;
                return <PostActions post={notification.post} disablePadding />;
            case NotificationType.Quote:
                return <PostActions post={notification.quote} disablePadding />;
            default:
                return;
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
                <div className="flex flex-1 items-start space-x-4">
                    {Icon ? <Icon className="text-secondary" width={24} height={24} /> : null}
                    <div className="flex-1">
                        <div className="flex flex-1 items-center justify-between">
                            <div className="flex items-center">
                                {profiles.slice(0, 5).map((profile, index, self) => {
                                    const isFallbackPfp = profile.pfp.startsWith('https://cdn.stamp.fyi/avatar/eth:');
                                    const avatar = isFallbackPfp
                                        ? isDarkMode
                                            ? '/image/firefly-dark-avatar.png'
                                            : '/image/firefly-light-avatar.png'
                                        : profile.pfp;
                                    return (
                                        <Link
                                            key={index}
                                            href={getProfileUrl(profile)}
                                            className={classNames('inline-flex items-center', {
                                                '-ml-5': index > 0 && self.length > 1,
                                            })}
                                            style={{ zIndex: self.length - index }}
                                        >
                                            <Image
                                                loading="lazy"
                                                className="h-10 w-10 rounded-full"
                                                src={avatar}
                                                width={40}
                                                height={40}
                                                alt={profile.profileId}
                                            />
                                        </Link>
                                    );
                                })}
                            </div>
                            <div className="flex items-center space-x-2">
                                <SourceIcon source={notification.source} />
                                {showMoreAction ? (
                                    <>
                                        <span className="text-xs leading-4 text-secondary">
                                            <TimestampFormatter time={notification.timestamp} />
                                        </span>
                                        <span className="text-secondary">
                                            <More width={24} height={24} />
                                        </span>
                                    </>
                                ) : null}
                            </div>
                        </div>
                        <div className="mt-2">{title}</div>
                        {content}
                        {actions}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});
