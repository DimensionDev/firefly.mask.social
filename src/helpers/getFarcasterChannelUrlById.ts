import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';

export function getFarcasterChannelUrlById(channelId: string) {
    return urlcat('/channel/:id', {
        source: Source.Farcaster.toLowerCase(),
        id: channelId,
    });
}
