import { safeUnreachable } from '@masknet/kit';

import { SocialPlatform } from '@/constants/enum.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';

export function getChannelById(source: SocialPlatform, channelId: string) {
    switch (source) {
        case SocialPlatform.Lens:
            return null;
        case SocialPlatform.Farcaster:
            // in fact, channelId is channelHandle
            return FarcasterSocialMediaProvider.getChannelByHandle(channelId);
        case SocialPlatform.Twitter:
            return null;
        default:
            safeUnreachable(source);
            return null;
    }
}
