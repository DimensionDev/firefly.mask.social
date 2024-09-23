import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export function getChannelUrl(channel: Channel) {
    switch (channel.source) {
        case Source.Lens:
            return '';
        case Source.Farcaster:
            if (!channel.id) return '';
            return urlcat('/channel/:id', {
                id: channel.id,
            });
        case Source.Twitter:
            return '';
        default:
            safeUnreachable(channel.source);
            return '';
    }
}
