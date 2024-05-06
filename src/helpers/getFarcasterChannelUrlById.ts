import urlcat from 'urlcat';

import { SocialPlatform } from '@/constants/enum.js';

export function getFarcasterChannelUrlById(channelId: string) {
    return urlcat('/channel/:id', {
        source: SocialPlatform.Farcaster.toLowerCase(),
        id: channelId,
    });
}
