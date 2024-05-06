import { useRouter } from 'next/navigation.js';
import { memo, useMemo } from 'react';

import { Avatar } from '@/components/Avatar.js';
import { ChannelCard } from '@/components/Channel/ChannelCard.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { Tippy } from '@/esm/Tippy.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface ChannelAnchorprops {
    channel: Channel;
}

export const ChannelAnchor = memo<ChannelAnchorprops>(function ChannelAnchor({ channel }) {
    const isMedium = useIsMedium();
    const router = useRouter();
    const content = useMemo(() => {
        return (
            <ClickableArea className="my-2 flex justify-end">
                <div
                    onClick={() => {
                        if (!channel) return;
                        router.push(getChannelUrl(channel));
                    }}
                    className="flex items-center gap-1 rounded-full border border-secondaryLine bg-bg px-2 py-1"
                >
                    {channel.imageUrl ? (
                        <Avatar src={channel.imageUrl} alt={channel.id} size={16} className="h-4 w-4 rounded-full" />
                    ) : (
                        <SourceIcon className="rounded-full" source={channel.source} size={16} />
                    )}
                    <span className="text-[15px] text-secondary">/{channel.id}</span>
                </div>
            </ClickableArea>
        );
    }, [channel, router]);

    return isMedium ? (
        <Tippy
            maxWidth={400}
            className="channel-card"
            placement="bottom"
            duration={200}
            arrow={false}
            trigger="mouseenter"
            hideOnClick
            interactive
            content={<ChannelCard channel={channel} />}
        >
            {content}
        </Tippy>
    ) : (
        content
    );
});
