import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useState } from 'react';

import ComeBackIcon from '@/assets/comeback.svg';
import { ChannelMoreAction } from '@/components/Channel/ChannelMoreAction.js';
import { useComeBack } from '@/hooks/useComeback.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface TitleProps {
    channel: Channel;
}

export function Title({ channel }: TitleProps) {
    const [reached, setReached] = useState(false);

    const { scrollY } = useScroll();
    const isMedium = useIsMedium();

    useMotionValueEvent(scrollY, 'change', (value) => {
        setReached(value > 48);
    });

    const comeback = useComeBack();

    return (
        <div className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-line bg-primaryBottom px-4">
            <div className="flex items-center gap-7">
                <ComeBackIcon className="cursor-pointer text-lightMain" onClick={comeback} />
                <span className="text-xl font-black text-lightMain">{channel.name ?? '-'}</span>
            </div>

            {(channel && reached) || !isMedium ? <ChannelMoreAction channel={channel} /> : null}
        </div>
    );
}
