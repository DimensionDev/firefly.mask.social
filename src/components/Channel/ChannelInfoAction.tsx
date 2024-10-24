'use client';

import { ChannelMoreAction } from '@/components/Channel/ChannelMoreAction.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export function ChannelInfoAction({ channel }: { channel: Channel }) {
    const isMedium = useIsMedium();

    return isMedium ? (
        <div className="absolute right-0 top-0">
            <ChannelMoreAction channel={channel} />
        </div>
    ) : null;
}
