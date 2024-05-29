import { useRouter } from 'next/navigation.js';
import { memo } from 'react';

import { Avatar } from '@/components/Avatar.js';
import { ChannelTippy } from '@/components/Channel/ChannelTippy.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface ChannelAnchorProps {
    channel: Channel;
}

export const ChannelAnchor = memo<ChannelAnchorProps>(function ChannelAnchor({ channel }) {
    const router = useRouter();

    return (
        <div className="my-2 flex justify-end">
            <ChannelTippy channel={channel}>
                <ClickableArea>
                    <div
                        onClick={() => {
                            if (!channel) return;
                            router.push(getChannelUrl(channel));
                        }}
                        className="flex items-center gap-1 rounded-full border border-secondaryLine bg-bg px-2 py-1"
                    >
                        {channel.imageUrl ? (
                            <Avatar
                                src={channel.imageUrl}
                                alt={channel.id}
                                size={16}
                                className="h-4 w-4 rounded-full"
                            />
                        ) : (
                            <SocialSourceIcon className="rounded-full" source={channel.source} size={16} />
                        )}
                        <span className="text-[12px] leading-[16px] text-main">/{channel.id}</span>
                    </div>
                </ClickableArea>
            </ChannelTippy>
        </div>
    );
});
