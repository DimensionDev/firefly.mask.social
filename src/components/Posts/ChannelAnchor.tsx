import { memo } from 'react';

import { Avatar } from '@/components/Avatar.js';
import { ChannelTippy } from '@/components/Channel/ChannelTippy.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { Link } from '@/esm/Link.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface ChannelAnchorProps {
    channel: Channel;
}

export const ChannelAnchor = memo<ChannelAnchorProps>(function ChannelAnchor({ channel }) {
    return (
        <div className="my-2 flex justify-end">
            <ChannelTippy channel={channel}>
                <Link
                    href={getChannelUrl(channel)}
                    className="flex items-center gap-1 rounded-full border border-secondaryLine bg-bg px-2 py-1"
                >
                    {channel.imageUrl ? (
                        <Avatar src={channel.imageUrl} alt={channel.id} size={16} className="h-4 w-4 rounded-full" />
                    ) : (
                        <SocialSourceIcon className="rounded-full" source={channel.source} size={16} />
                    )}
                    <span className="text-[12px] leading-[16px] text-main">/{channel.id}</span>
                </Link>
            </ChannelTippy>
        </div>
    );
});
