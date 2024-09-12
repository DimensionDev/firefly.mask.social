import { useState } from 'react';
import { createContainer } from 'unstated-next';

import type { Channel } from '@/providers/types/SocialMedia.js';

interface ChannelPageContext {
    channel: Channel | null;
}

function createEmptyContext(): ChannelPageContext {
    return {
        channel: null,
    };
}

function useChannelPageContext(initialState?: ChannelPageContext) {
    const [value, setValue] = useState<ChannelPageContext>(initialState ?? createEmptyContext());

    return {
        ...value,
        update: setValue,
        reset: () => setValue(createEmptyContext()),
    };
}

export const ChannelPageContext = createContainer(useChannelPageContext);
