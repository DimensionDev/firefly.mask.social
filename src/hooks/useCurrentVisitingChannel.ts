import { usePathname } from 'next/navigation.js';
import { useEffect } from 'react';

import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useValueRef } from '@/hooks/useValueRef.js';
import { ValueRef } from '@/libs/ValueRef.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

const currentVisitingChannel = new ValueRef<Channel | null>(null);

export function useUpdateCurrentVisitingChannel(channel: Channel | null) {
    useEffect(() => {
        currentVisitingChannel.value = channel;
    }, [channel]);
}

export function useCurrentVisitingChannel() {
    const pathname = usePathname();
    const isChannelPage = isRoutePathname(pathname, '/channel');
    const channel = useValueRef(currentVisitingChannel);
    return isChannelPage ? channel : null;
}
