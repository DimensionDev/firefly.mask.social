import { HOME_CHANNEL } from '@/constants/channel.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export function isHomeChannel(channel: Channel | null) {
    if (!channel) return false;
    return channel.id === HOME_CHANNEL.id;
}
