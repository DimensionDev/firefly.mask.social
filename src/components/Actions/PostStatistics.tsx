import { t, Trans } from '@lingui/macro';
import { compact } from 'lodash-es';
import { Fragment, type HTMLProps, memo, useMemo } from 'react';

import { ChannelAnchor } from '@/components/Posts/ChannelAnchor.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
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
    const likes = countText(post.stats?.reactions, t`Like`, t`Likes`);
    const collects = countText(post.stats?.countOpenActions, t`Collect`, t`Collects`);
    const mirrors = countText(post.stats?.mirrors, t`Mirror`, t`Mirrors`);
    const quotes = countText(post.stats?.quotes, t`Quote`, t`Quotes`);
    const views = countText(viewCount, t`View`, t`Views`);

    const sendFrom = useMemo(() => {
        if (!post.sendFrom?.displayName) return null;
        if (post.sendFrom.displayName === 'firefly') return t`Firefly App`;
        return post.sendFrom.displayName;
    }, [post.sendFrom?.displayName]);

    return (
        <div className={classNames('min-h-6 flex w-full justify-between text-xs leading-6 text-second', className)}>
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
        </div>
    );
});
