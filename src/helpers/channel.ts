import { HOME_CHANNEL } from '@/constants/channel.js';
import type { SocialPlatform } from '@/constants/enum.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export function isHomeChannel(channel: Channel, source: SocialPlatform) {
    return channel.id === HOME_CHANNEL[source].id;
}
