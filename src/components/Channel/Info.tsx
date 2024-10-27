import { Plural } from '@lingui/macro';
import type { HTMLProps } from 'react';
import urlcat from 'urlcat';

import UserIcon from '@/assets/user.svg';
import { Avatar } from '@/components/Avatar.js';
import { ChannelInfoAction } from '@/components/Channel/ChannelInfoAction.js';
import { ChannelInfoBio } from '@/components/Channel/ChannelInfoBio.js';
import { NoSSR } from '@/components/NoSSR.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { type SocialSource } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface InfoProps extends HTMLProps<HTMLDivElement> {
    channel: Channel;
    source: SocialSource;
    isChannelPage?: boolean;
}

export function Info({ channel, source, isChannelPage = false, ...rest }: InfoProps) {
    const followerCount = channel.followerCount ?? 0;

    const url = urlcat(SITE_URL, getChannelUrl(channel));
    const avatar = channel.imageUrl ? (
        <Avatar src={channel.imageUrl} alt="avatar" size={48} className="h-12 w-12 rounded-full" />
    ) : (
        <SocialSourceIcon className="rounded-full" source={source} size={48} />
    );
    const name = <span className="text-xl font-black text-lightMain">{channel.name}</span>;

    return (
        <article {...rest} className={classNames('flex gap-3 p-3', rest.className)}>
            {isChannelPage ? avatar : <Link href={url}>{avatar}</Link>}

            <div className="relative flex flex-1 flex-col gap-[6px]">
                <NoSSR>
                    <ChannelInfoAction channel={channel} />
                </NoSSR>

                <div className="flex flex-col">
                    <h1 className="flex items-center gap-2">
                        {isChannelPage ? name : <Link href={url}>{name}</Link>}
                        <SocialSourceIcon source={source} size={20} />
                    </h1>
                    <div className="flex flex-row gap-1">
                        <span className="text-medium text-secondary">/{channel.id}</span>
                        <data value={followerCount} className="flex items-center gap-1">
                            <UserIcon width={18} height={18} />
                            <span className="text-lightMain">{nFormatter(followerCount)}</span>
                            <span className="text-secondary">
                                <Plural value={followerCount} one="Follower" other="Followers" />
                            </span>
                        </data>
                    </div>
                </div>

                <ChannelInfoBio description={channel.description} />
            </div>
        </article>
    );
}
