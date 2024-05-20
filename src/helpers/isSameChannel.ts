import { HOME_CHANNEL } from '@/constants/channel.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export function isSameChannel(channel: Channel | null, otherChannel: Channel | null) {
    if (!channel || !otherChannel) return false;
    return channel.source === otherChannel.source && channel.id === otherChannel.id;
}

export function isHomeChannel(channel: Channel | null) {
    return isSameChannel(channel, HOME_CHANNEL);
}
