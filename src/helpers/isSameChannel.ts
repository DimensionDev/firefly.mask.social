import type { Channel } from '@/providers/types/SocialMedia.js';

export function isSameChannel(channel: Channel | null, otherChannel: Channel | null) {
    if (!channel || !otherChannel) return false;
    return channel.source === otherChannel.source && channel.id === otherChannel.id;
}
