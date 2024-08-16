import { type HTMLProps, memo } from 'react';

import { ChannelCard } from '@/components/Channel/ChannelCard.js';
import { InteractiveTippy } from '@/components/InteractiveTippy.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface ChannelTippyProps extends HTMLProps<HTMLDivElement> {
    channel: Channel;
}

export const ChannelTippy = memo<ChannelTippyProps>(function ChannelTippy({ channel, ...rest }) {
    const isMedium = useIsMedium();

    if (!isMedium) return rest.children;

    return (
        <InteractiveTippy
            appendTo={() => document.body}
            offset={[100, 0]}
            maxWidth={350}
            className="tippy-card"
            placement="bottom-end"
            content={<ChannelCard channel={channel} />}
        >
            <div {...rest} />
        </InteractiveTippy>
    );
});
