import { HOME_CHANNEL } from '@/constants/channel.js';
import { SocialPlatform } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export function isHomeChannel(channel: Channel) {
    return channel.id === HOME_CHANNEL.id;
}
const channelCache: Record<string, Channel> = {};
export async function fetchChannel(chanelId: string, source: SocialPlatform) {
    const key = `${source}-${chanelId}`;
    if (channelCache[key]) {
        return channelCache[key];
    }
    const provider = resolveSocialMediaProvider(source);
    channelCache[key] = await provider.getChannelById(chanelId);
    return channelCache[key];
}

export async function fetchFireflyGardenChannel(source: SocialPlatform) {
    switch (source) {
        case SocialPlatform.Farcaster:
            return fetchChannel('firefly-garden', source);
        default:
            return null;
    }
}
