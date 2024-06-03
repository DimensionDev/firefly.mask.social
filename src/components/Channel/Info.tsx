import { plural, Trans } from '@lingui/macro';
import dayjs from 'dayjs';
import type { HTMLProps } from 'react';

import UserIcon from '@/assets/user.svg';
import { Avatar } from '@/components/Avatar.js';
import { ChannelMoreAction } from '@/components/Channel/ChannelMoreAction.js';
import { BioMarkup } from '@/components/Markup/BioMarkup.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import type { SocialSource } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface InfoProps extends HTMLProps<HTMLDivElement> {
    channel: Channel;
    source: SocialSource;
}

export function Info({ channel, source, ...rest }: InfoProps) {
    const followerCount = channel.followerCount ?? 0;

    const isMedium = useIsMedium();

    return (
        <div {...rest} className={classNames('flex gap-3 p-3', rest.className)}>
            {channel.imageUrl ? (
                <Avatar src={channel.imageUrl} alt="avatar" size={80} className="h-20 w-20 rounded-full" />
            ) : (
                <SocialSourceIcon className="rounded-full" source={source} size={80} />
            )}

            <div className="relative flex flex-1 flex-col gap-[6px]">
                {isMedium ? (
                    <div className="absolute right-0 top-0">
                        <ChannelMoreAction channel={channel} />
                    </div>
                ) : null}

                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-lightMain">{channel.name}</span>
                        <SocialSourceIcon source={source} size={20} />
                    </div>
                    <div className="flex flex-row gap-1">
                        <span className="text-[15px] text-secondary">/{channel.id}</span>
                        <div className="flex items-center gap-1">
                            <UserIcon width={18} height={18} />
                            <span className="text-lightMain">{nFormatter(followerCount)}</span>
                            <span className="text-secondary">
                                {plural(followerCount, {
                                    one: 'Follower',
                                    other: 'Followers',
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                <BioMarkup className="text-[15px]">{channel.description ?? '-'}</BioMarkup>

                <div className="flex justify-between gap-3 text-[15px]">
                    <div className="flex gap-1">
                        <Trans>
                            <span className="text-secondary">since </span>{' '}
                            <strong>{dayjs(channel.timestamp).format('MMM DD, YYYY')}</strong>
                        </Trans>
                    </div>
                </div>
            </div>
        </div>
    );
}
