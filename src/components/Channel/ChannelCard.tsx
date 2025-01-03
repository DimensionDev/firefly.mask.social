import { Trans } from '@lingui/macro';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation.js';
import { memo, type MouseEvent, useCallback } from 'react';

import UserIcon from '@/assets/user.svg';
import { Avatar } from '@/components/Avatar.js';
import { BioMarkup } from '@/components/Markup/BioMarkup.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface ChannelCardProps {
    channel?: Channel;
    loading?: boolean;
}

export const ChannelCard = memo<ChannelCardProps>(function ChannelCard({ channel, loading }) {
    const router = useRouter();
    const handleNavigateToDetail = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            event.stopPropagation();
            event.preventDefault();
            if (!channel) return;
            router.push(getChannelUrl(channel));
        },
        [channel, router],
    );

    if (loading) {
        return (
            <div className="w-[350px] rounded-2xl border border-secondaryLine bg-primaryBottom p-4">
                <div className="animate-pulse">
                    <div className="flex w-full gap-[10px]">
                        <div className="h-20 w-20 rounded-full bg-third" />
                        <div className="flex flex-1 flex-col justify-between">
                            <div className="h-3 w-[120px] rounded bg-third" />
                            <div className="h-3 w-[120px] rounded bg-third" />
                            <div className="h-3 w-[120px] rounded bg-third" />
                        </div>
                    </div>
                    <div className="mt-3 space-y-4">
                        <div className="h-3 w-full rounded bg-third" />
                        <div className="h-3 w-full rounded bg-third" />
                    </div>
                </div>
            </div>
        );
    }

    if (!channel) return;

    const followerCount = channel.followerCount ?? 0;

    return (
        <div className="w-[350px] rounded-2xl border border-secondaryLine bg-primaryBottom p-4">
            <div className="flex gap-[10px]">
                {channel.imageUrl ? (
                    <Avatar
                        src={channel.imageUrl}
                        alt="avatar"
                        size={80}
                        onClick={handleNavigateToDetail}
                        className="h-20 w-20 cursor-pointer rounded-full"
                    />
                ) : (
                    <SocialSourceIcon className="rounded-full" source={channel.source} size={80} />
                )}

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-center gap-[6px] whitespace-nowrap">
                        <span
                            onClick={handleNavigateToDetail}
                            className="cursor-pointer overflow-auto truncate text-lg font-bold text-lightMain"
                        >
                            {channel?.name}
                        </span>
                        <SocialSourceIcon source={channel.source} className="shrink-0" size={18} />
                    </div>
                    <div
                        onClick={handleNavigateToDetail}
                        className="flex cursor-pointer items-center gap-2 text-medium text-secondary"
                    >
                        <span className="min-w-0 truncate whitespace-nowrap"> /{channel?.id}</span>
                        <div className="flex items-center gap-2">
                            <UserIcon width={18} height={18} />
                            <data value={followerCount} className="text-medium leading-6 text-lightMain">
                                {nFormatter(followerCount)}
                            </data>
                        </div>
                    </div>

                    <div className="flex min-h-5 gap-1">
                        {channel.timestamp ? (
                            <Trans>
                                <span className="text-secondary">since </span>{' '}
                                <strong className="text-lightMain">
                                    {dayjs(channel.timestamp).format('MMM DD, YYYY')}
                                </strong>
                            </Trans>
                        ) : null}
                    </div>
                </div>
            </div>

            <div onClick={handleNavigateToDetail}>
                <BioMarkup
                    className="mt-3 line-clamp-2 text-medium leading-[22px] text-lightMain"
                    source={channel.source}
                >
                    {channel.description ?? '-'}
                </BioMarkup>
            </div>
        </div>
    );
});
