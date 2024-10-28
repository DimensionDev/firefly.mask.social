'use client';

import type { PropsWithChildren } from 'react';

import { ChannelPageContext } from '@/hooks/useChannelPageContext.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export function ChannelProvider({ channel, children }: PropsWithChildren<{ channel: Channel | null }>) {
    return <ChannelPageContext.Provider initialState={{ channel }}>{children}</ChannelPageContext.Provider>;
}
