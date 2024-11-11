'use client';

import type { PropsWithChildren } from 'react';

import { ChannelPageContext } from '@/hooks/useChannelPageContext.js';
import { useUpdateCurrentVisitingChannel } from '@/hooks/useCurrentVisitingChannel.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export function ChannelProvider({ channel, children }: PropsWithChildren<{ channel: Channel | null }>) {
    useUpdateCurrentVisitingChannel(channel);

    return <ChannelPageContext.Provider initialState={{ channel }}>{children}</ChannelPageContext.Provider>;
}
