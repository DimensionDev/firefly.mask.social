import { HOME_CHANNEL } from '@/constants/channel.js';
import { SocialPlatform } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export function isHomeChannel(channel: Channel) {
    return channel.id === HOME_CHANNEL.id;
}
