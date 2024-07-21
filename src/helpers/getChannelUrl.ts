import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { safeUnreachable } from '@/helpers/controlFlow.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export function getChannelUrl(channel: Channel) {
    switch (channel.source) {
        case Source.Lens:
            return '';
        case Source.Farcaster:
            if (!channel.id) return '';
            return urlcat('/channel/:id', {
                source: channel.source.toLowerCase(),
                id: channel.id,
            });
        case Source.Twitter:
            return '';
        default:
            safeUnreachable(channel.source);
            return '';
    }
}
