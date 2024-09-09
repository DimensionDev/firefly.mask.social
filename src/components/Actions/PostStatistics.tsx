import { Plural, plural, t, Trans } from '@lingui/macro';
import dayjs from 'dayjs';
import { compact, sumBy } from 'lodash-es';
import { usePathname } from 'next/navigation.js';
import { Fragment, type HTMLProps, memo, type ReactNode, useMemo } from 'react';

import FireflyAvatarIcon from '@/assets/firefly-avatar.svg';
import { ChannelAnchor } from '@/components/Posts/ChannelAnchor.js';
import { EngagementType, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { getPollTimeLeft } from '@/helpers/getPollTimeLeft.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { isSendFromFirefly } from '@/helpers/isSendFromFirefly.js';
import { resolveEngagementLink } from '@/helpers/resolveEngagementLink.js';
import type { Poll } from '@/providers/types/Poll.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface Props extends HTMLProps<HTMLDivElement> {
    post: Post;
    showChannelTag?: boolean;
    isComment?: boolean;
    hideDate?: boolean;
    hideSource?: boolean;

    onSetScrollIndex?: () => void;
}

function EngagementLink({
    children,
    prefetch = false,
    ...props
}: {
    post: Post;
    type: EngagementType;
    prefetch?: boolean;
    children?: ReactNode;
    onSetScrollIndex?: () => void;
}) {
    if (props.post.source === Source.Twitter) {
        return <span>{children}</span>;
    }
    return (
        <Link
            prefetch={prefetch}
            className="hover:underline"
            href={resolveEngagementLink(props.post.postId, props.post.source, props.type)}
            onClick={(ev) => {
                ev.stopPropagation();
                props.onSetScrollIndex?.();
            }}
        >
            {children}
        </Link>
    );
}

function PollVotes({ poll }: { poll: Poll }) {
    const { timeLeft, totalVotes } = useMemo(
        () => ({
            timeLeft:
                poll.votingStatus === 'closed' || (poll.endDatetime && dayjs(poll.endDatetime).isBefore(new Date()))
                    ? t`Final results`
                    : poll.endDatetime
                      ? getPollTimeLeft(poll.endDatetime)
                      : '',
            totalVotes: sumBy(poll.options, (option) => option.votes ?? 0),
        }),
        [poll.votingStatus, poll.endDatetime, poll.options],
    );

    return (
        <>
            <Plural value={totalVotes} one={`${totalVotes} Vote`} other={`${totalVotes} Votes`} />
            {timeLeft ? ` · ${timeLeft}` : ''}
        </>
    );
}

export const PostStatistics = memo<Props>(function PostStatistics({
    className,
    post,
    showChannelTag = true,
    isComment = false,
    hideDate = false,
    hideSource = false,
    onSetScrollIndex,
}: Props) {
    const pathname = usePathname();
    const publicationViews = useImpressionsStore.use.publicationViews();
    const viewCount = useMemo(
        () => publicationViews.find((x) => x.id === post.postId)?.views,
        [publicationViews, post],
    );

    const comments = post.stats?.comments ? (
        <span
            className={classNames({
                'hover:underline': post.source !== Source.Twitter,
            })}
        >
            <span className="mr-[2px] font-bold">{post.stats.comments}</span>
            {plural(post.stats.comments, {
                one: 'comment',
                other: 'comments',
            })}
        </span>
    ) : null;
    const likes = post.stats?.reactions ? (
        <EngagementLink post={post} type={EngagementType.Likes} onSetScrollIndex={onSetScrollIndex}>
            <span className="mr-[2px] font-bold">{post.stats.reactions}</span>
            {plural(post.stats.reactions, {
                one: 'like',
                other: 'likes',
            })}
        </EngagementLink>
    ) : null;
    const collects = post.stats?.countOpenActions ? (
        <>
            <span className="mr-[2px] font-bold">{post.stats.countOpenActions}</span>
            {plural(post.stats.countOpenActions, {
                one: 'comment',
                other: 'comments',
            })}
        </>
    ) : null;
    const mirrors = post.stats?.mirrors ? (
        <EngagementLink post={post} type={EngagementType.Mirrors} onSetScrollIndex={onSetScrollIndex}>
            <span className="mr-[2px] font-bold">{post.stats.mirrors}</span>
            {{
                [Source.Farcaster]: plural(post.stats.mirrors, {
                    one: 'recast',
                    other: 'recasts',
                }),
                [Source.Lens]: plural(post.stats.mirrors, {
                    one: 'mirror',
                    other: 'mirrors',
                }),
                [Source.Twitter]: plural(post.stats.mirrors, {
                    one: 'repost',
                    other: 'reposts',
                }),
            }[post.source] ?? null}
        </EngagementLink>
    ) : null;
    const quotes = post.stats?.quotes ? (
        <EngagementLink post={post} type={EngagementType.Quotes} onSetScrollIndex={onSetScrollIndex}>
            <span className="mr-[2px] font-bold">{post.stats.quotes}</span>
            {plural(post.stats.quotes, {
                one: 'quote',
                other: 'quotes',
            })}
        </EngagementLink>
    ) : null;
    const views = viewCount ? (
        <>
            <span className="mr-[2px] font-bold">{viewCount}</span>
            {plural(viewCount, {
                one: 'view',
                other: 'views',
            })}
        </>
    ) : null;
    const pollVotes = post.poll ? <PollVotes poll={post.poll} /> : null;

    const sendFrom = post.sendFrom?.displayName === 'Firefly App' ? 'Firefly' : post.sendFrom?.displayName;

    const isDetailPage = isRoutePathname(pathname, '/post/:detail', true);

    const statisticsItems =
        !isDetailPage || isComment
            ? compact([
                  comments,
                  likes,
                  pollVotes,
                  !isDetailPage && showChannelTag && post.channel ? (
                      <ChannelAnchor
                          className="!inline-flex translate-y-1"
                          channel={post.channel}
                          onClick={onSetScrollIndex}
                      />
                  ) : null,
              ])
            : compact([
                  post.timestamp && !hideDate ? (
                      <>
                          <span>{dayjs(post.timestamp).format('hh:mm A')}</span>
                          <span>{' · '}</span>
                          <span>{dayjs(post.timestamp).format('MMM DD, YYYY')}</span>
                      </>
                  ) : null,
                  likes,
                  collects,
                  mirrors,
                  quotes,
                  views,
                  pollVotes,
                  sendFrom && !hideSource ? (
                      <Trans>
                          Posted via{' '}
                          {isSendFromFirefly(post) ? (
                              <FireflyAvatarIcon fontSize={15} width={15} height={15} className="inline" />
                          ) : null}{' '}
                          <span className="capitalize">{sendFrom}</span>
                      </Trans>
                  ) : null,
              ]);

    if (!statisticsItems.length) return null;

    return (
        <div className={classNames('flex min-h-6 w-full justify-between text-xs leading-6 text-second', className)}>
            <div>
                {statisticsItems.map((item, i, arr) => {
                    const isLast = arr.length - 1 === i;
                    return (
                        <Fragment key={i}>
                            <span>{item}</span>
                            {!isLast ? <span>{' · '}</span> : null}
                        </Fragment>
                    );
                })}
            </div>
        </div>
    );
});
