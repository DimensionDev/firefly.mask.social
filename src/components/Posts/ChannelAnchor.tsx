import { type HTMLProps, memo } from 'react';

import { Avatar } from '@/components/Avatar.js';
import { ChannelTippy } from '@/components/Channel/ChannelTippy.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface ChannelAnchorProps extends HTMLProps<HTMLDivElement> {
    channel: Channel;
}

export const ChannelAnchor = memo<ChannelAnchorProps>(function ChannelAnchor({ channel, onClick, ...rest }) {
    return (
        <div
            {...rest}
            className={classNames(rest.className, 'flex justify-end text-[12px] leading-[16px] text-main')}
            onClick={(event) => {
                event.stopPropagation();
                onClick?.(event);
            }}
        >
            <ChannelTippy channel={channel}>
                <Link href={getChannelUrl(channel)} className="flex items-center gap-1">
                    {channel.imageUrl ? (
                        <Avatar
                            src={channel.imageUrl}
                            alt={channel.id}
                            size={15}
                            className="h-[15px] w-[15px] rounded-full"
                        />
                    ) : (
                        <SocialSourceIcon className="rounded-full" source={channel.source} size={15} />
                    )}
                    <span>/{channel.id}</span>
                </Link>
            </ChannelTippy>
        </div>
    );
});
