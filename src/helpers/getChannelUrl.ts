import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { SocialPlatform } from '@/constants/enum.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export function getChannelUrl(channel: Channel) {
    switch (channel.source) {
        case SocialPlatform.Lens:
            return '';
        case SocialPlatform.Farcaster:
            if (!channel.id) return '';
            return urlcat('/channel/:id', {
                source: channel.source.toLowerCase(),
                id: channel.id,
            });
        case SocialPlatform.Twitter:
            return '';
        default:
            safeUnreachable(channel.source);
            return '';
    }
}
