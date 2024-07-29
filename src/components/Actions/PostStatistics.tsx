import { plural, Trans } from '@lingui/macro';
import { compact } from 'lodash-es';
import { usePathname } from 'next/navigation.js';
import { Fragment, type HTMLProps, memo, type ReactNode, useMemo } from 'react';

import FireflyAvatarIcon from '@/assets/firefly-avatar.svg';
import { ChannelAnchor } from '@/components/Posts/ChannelAnchor.js';
import { EngagementType, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { resolveEngagementLink } from '@/helpers/resolveEngagementLink.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface Props extends HTMLProps<HTMLDivElement> {
    post: Post;
    showChannelTag?: boolean;

    onSetScrollIndex?: () => void;
}

function EngagementLink({
    children,
    ...props
}: {
    post: Post;
    type: EngagementType;
    children?: ReactNode;
    onSetScrollIndex?: () => void;
}) {
    if (props.post.source === Source.Twitter) {
        return <span>{children}</span>;
    }
    return (
        <Link
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

export const PostStatistics = memo<Props>(function PostStatistics({
    className,
    post,
    showChannelTag = true,
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
            {plural(post.stats.comments, {
                one: '1 comment',
                other: `${post.stats.comments} comments`,
            })}
        </span>
    ) : null;
    const likes = post.stats?.reactions ? (
        <EngagementLink post={post} type={EngagementType.Likes} onSetScrollIndex={onSetScrollIndex}>
            {plural(post.stats.reactions, {
                one: '1 like',
                other: `${post.stats.reactions} likes`,
            })}
        </EngagementLink>
    ) : null;
    const collects = post.stats?.countOpenActions
        ? plural(post.stats?.countOpenActions, {
              one: '1 comment',
              other: `${post.stats?.countOpenActions} comments`,
          })
        : null;
    const mirrors = post.stats?.mirrors ? (
        post.source === Source.Farcaster ? (
            <EngagementLink post={post} type={EngagementType.Recasts} onSetScrollIndex={onSetScrollIndex}>
                {plural(post.stats.mirrors, {
                    one: '1 recast',
                    other: `${post.stats.mirrors} recasts`,
                })}
            </EngagementLink>
        ) : (
            <EngagementLink post={post} type={EngagementType.Mirrors} onSetScrollIndex={onSetScrollIndex}>
                {plural(post.stats.mirrors, {
                    one: '1 mirror',
                    other: `${post.stats.mirrors} mirrors`,
                })}
            </EngagementLink>
        )
    ) : null;
    const quotes = post.stats?.quotes ? (
        <EngagementLink post={post} type={EngagementType.Quotes} onSetScrollIndex={onSetScrollIndex}>
            {plural(post.stats.quotes, {
                one: '1 quote',
                other: `${post.stats.quotes} quotes`,
            })}
        </EngagementLink>
    ) : null;
    const views = viewCount
        ? plural(viewCount, {
              one: '1 view',
              other: `${viewCount} views`,
          })
        : null;
    const isSmall = useIsSmall();

    const sendFrom = post.sendFrom?.displayName === 'Firefly App' ? 'Firefly' : post.sendFrom?.displayName;
    const isFirefly = sendFrom?.toLowerCase() === 'firefly';

    const isDetailPage = isRoutePathname(pathname, '/post/:detail');

    return (
        <div className={classNames('min-h-6 flex w-full justify-between text-xs leading-6 text-second', className)}>
            <div>
                {(!isDetailPage
                    ? compact([
                          comments,
                          likes,
                          !isDetailPage && !isSmall && sendFrom ? (
                              <span>
                                  <Trans>
                                      via{' '}
                                      {isFirefly ? (
                                          <FireflyAvatarIcon fontSize={15} width={15} height={15} className="inline" />
                                      ) : null}{' '}
                                      <span className="capitalize">{sendFrom}</span>
                                  </Trans>
                              </span>
                          ) : null,
                          !isDetailPage && !isSmall && showChannelTag && post.channel ? (
                              <ChannelAnchor
                                  className="!inline-flex translate-y-1"
                                  channel={post.channel}
                                  onClick={onSetScrollIndex}
                              />
                          ) : null,
                      ])
                    : compact([
                          likes,
                          collects,
                          mirrors,
                          quotes,
                          views,
                          sendFrom ? (
                              <Trans>
                                  Posted via{' '}
                                  {isFirefly ? (
                                      <FireflyAvatarIcon fontSize={15} width={15} height={15} className="inline" />
                                  ) : null}{' '}
                                  <span className="capitalize">{sendFrom}</span>
                              </Trans>
                          ) : null,
                      ])
                ).map((item, i, arr) => {
                    const isLast = arr.length - 1 === i;
                    return (
                        <Fragment key={i}>
                            <span>{item}</span>
                            {!isLast ? <span>{' · '}</span> : null}
                        </Fragment>
                    );
                })}
            </div>
            {!isDetailPage && isSmall ? (
                <div className="flex items-center">
                    {sendFrom ? (
                        <div>
                            <Trans>
                                via{' '}
                                {isFirefly ? (
                                    <FireflyAvatarIcon fontSize={15} width={15} height={15} className="inline" />
                                ) : null}{' '}
                                <span className="capitalize">{sendFrom}</span>
                            </Trans>
                        </div>
                    ) : null}
                    {showChannelTag && post.channel ? (
                        <>
                            {sendFrom ? <div className="w-3 text-center">{' · '}</div> : null}
                            <ChannelAnchor channel={post.channel} onClick={onSetScrollIndex} />
                        </>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
});
