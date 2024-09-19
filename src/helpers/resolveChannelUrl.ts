import urlcat from 'urlcat';

import { ChannelTabType } from '@/constants/enum.js';

export function resolveChannelUrl(id: string, type: ChannelTabType = ChannelTabType.Trending) {
    return urlcat(`/channel/:id/:type`, {
        id,
        type,
    });
}
