import { t, Trans } from '@lingui/macro';
import { compact } from 'lodash-es';
import { Fragment, type HTMLProps, memo, useMemo } from 'react';

import { ClickableArea } from '@/components/ClickableArea.js';
import { ChannelAnchor } from '@/components/Posts/ChannelAnchor.js';
import { EngagementType, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { resolveEngagementLink } from '@/helpers/resolveEngagementLink.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface Props extends HTMLProps<HTMLDivElement> {
    post: Post;
    showChannelTag?: boolean;
    channelProps?: HTMLProps<HTMLDivElement>;
    isDetail?: boolean;
}

function countText(count?: number, singular?: string, plural?: string) {
    if (!count) return null;
    if (count === 1) return `${nFormatter(count)} ${singular}`;
    return `${nFormatter(count)} ${plural}`;
}

function EngagementLink(props: {
    post: Post;
    type: EngagementType;
    count?: number;
    singular?: string;
    plural?: string;
}) {
    const count = countText(props.count, props.singular, props.plural);
    if (!count) return null;
    return (
        <Link
            className="hover:underline"
            href={resolveEngagementLink(props.post.postId, props.post.source, props.type)}
        >
            {count}
        </Link>
    );
}

export const PostStatistics = memo<Props>(function PostStatistics({
    className,
    channelProps,
    post,
    isDetail = false,
    showChannelTag = true,
}: Props) {
    const publicationViews = useImpressionsStore.use.publicationViews();
    const viewCount = useMemo(
        () => publicationViews.find((x) => x.id === post.postId)?.views,
        [publicationViews, post],
    );

    const comments = countText(post.stats?.comments, t`Comment`, t`Comments`);
    const likes = post.stats?.reactions ? (
        <EngagementLink
            post={post}
            count={post.stats.reactions}
            singular={t`Like`}
            plural={t`Likes`}
            type={EngagementType.Likes}
        />
    ) : null;
    const collects = countText(post.stats?.countOpenActions, t`Collect`, t`Collects`);
    const mirrors = post.stats?.mirrors ? (
        post.source === Source.Farcaster ? (
            <EngagementLink
                post={post}
                type={EngagementType.Recasts}
                count={post.stats.mirrors}
                singular={t`Recast`}
                plural={t`Recasts`}
            />
        ) : (
            <EngagementLink
                post={post}
                type={EngagementType.Mirrors}
                count={post.stats.mirrors}
                singular={t`Mirror`}
                plural={t`Mirror`}
            />
        )
    ) : null;
    const quotes = post.stats?.quotes ? (
        <EngagementLink
            post={post}
            type={EngagementType.Quotes}
            count={post.stats.quotes}
            singular={t`Quote`}
            plural={t`Quotes`}
        />
    ) : null;
    const views = countText(viewCount, t`View`, t`Views`);

    const sendFrom = post.sendFrom?.displayName;

    return (
        <ClickableArea
            className={classNames('min-h-6 flex w-full justify-between text-xs leading-6 text-second', className)}
        >
            <div>
                {(!isDetail
                    ? compact([comments, likes])
                    : compact([
                          comments,
                          likes,
                          collects,
                          mirrors,
                          quotes,
                          views,
                          sendFrom ? (
                              <Trans>
                                  Posted via <span className="capitalize">{sendFrom}</span>
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
            {!isDetail ? (
                <div className="flex items-center">
                    {sendFrom ? (
                        <div>
                            <Trans>
                                via <span className="capitalize">{sendFrom}</span>
                            </Trans>
                        </div>
                    ) : null}
                    {showChannelTag && post.channel ? (
                        <>
                            {sendFrom ? <div className="w-3 text-center">{' · '}</div> : null}
                            <ChannelAnchor channel={post.channel} {...channelProps} />
                        </>
                    ) : null}
                </div>
            ) : null}
        </ClickableArea>
    );
});
