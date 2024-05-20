import { ValueRef } from '@masknet/shared-base';
import { useValueRef } from '@masknet/shared-base-ui';
import { usePathname } from 'next/navigation.js';
import { useEffect } from 'react';

import { isRoutePathname } from '@/helpers/isRoutePathname.js';
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
