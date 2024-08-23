import { plural } from '@lingui/macro';
import type { HTMLProps } from 'react';
import urlcat from 'urlcat';

import UserIcon from '@/assets/user.svg';
import { Avatar } from '@/components/Avatar.js';
import { ChannelMoreAction } from '@/components/Channel/ChannelMoreAction.js';
import { BioMarkup } from '@/components/Markup/BioMarkup.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface InfoProps extends HTMLProps<HTMLDivElement> {
    channel: Channel;
    source: SocialSource;
    isChannelPage?: boolean;
}

export function Info({ channel, source, isChannelPage = false, ...rest }: InfoProps) {
    const followerCount = channel.followerCount ?? 0;

    const isMedium = useIsMedium();
    const url = urlcat(location.origin, getChannelUrl(channel));
    const avatar = channel.imageUrl ? (
        <Avatar src={channel.imageUrl} alt="avatar" size={48} className="h-12 w-12 rounded-full" />
    ) : (
        <SocialSourceIcon className="rounded-full" source={source} size={48} />
    );
    const name = <span className="text-xl font-black text-lightMain">{channel.name}</span>;

    return (
        <div {...rest} className={classNames('flex gap-3 p-3', rest.className)}>
            {isChannelPage ? avatar : <Link href={url}>{avatar}</Link>}

            <div className="relative flex flex-1 flex-col gap-[6px]">
                {isMedium ? (
                    <div className="absolute right-0 top-0">
                        <ChannelMoreAction channel={channel} />
                    </div>
                ) : null}

                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        {isChannelPage ? name : <Link href={url}>{name}</Link>}
                        <SocialSourceIcon source={source} size={20} />
                    </div>
                    <div className="flex flex-row gap-1">
                        <span className="text-medium text-secondary">/{channel.id}</span>
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

                <BioMarkup
                    className={classNames('text-medium', {
                        '-ml-[60px]': !isMedium,
                    })}
                    source={Source.Farcaster}
                >
                    {channel.description ?? '-'}
                </BioMarkup>
            </div>
        </div>
    );
}
