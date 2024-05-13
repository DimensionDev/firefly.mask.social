import { useRouter } from 'next/navigation.js';
import { memo, useMemo } from 'react';

import { Avatar } from '@/components/Avatar.js';
import { ChannelCard } from '@/components/Channel/ChannelCard.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { Tippy } from '@/esm/Tippy.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface ChannelAnchorProps {
    channel: Channel;
}

export const ChannelAnchor = memo<ChannelAnchorProps>(function ChannelAnchor({ channel }) {
    const isMedium = useIsMedium();
    const router = useRouter();
    const content = useMemo(() => {
        return (
            <ClickableArea>
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
                        <SocialSourceIcon className="rounded-full" source={channel.source} size={16} />
                    )}
                    <span className="text-[12px] leading-[16px] text-main">/{channel.id}</span>
                </div>
            </ClickableArea>
        );
    }, [channel, router]);

    return (
        <div className="my-2 flex justify-end">
            {isMedium ? (
                <Tippy
                    appendTo={() => document.body}
                    offset={[100, 0]}
                    maxWidth={400}
                    className="tippy-card"
                    placement="bottom-end"
                    duration={200}
                    arrow={false}
                    trigger="mouseenter"
                    hideOnClick
                    interactive
                    content={<ChannelCard channel={channel} />}
                >
                    <div>{content}</div>
                </Tippy>
            ) : (
                content
            )}
        </div>
    );
});
