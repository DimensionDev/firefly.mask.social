import { safeUnreachable } from '@masknet/kit';

import { SocialPlatform } from '@/constants/enum.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';

export function getFollowings(source: SocialPlatform, handleOrProfileId: string) {
    switch (source) {
        case SocialPlatform.Lens:
            return LensSocialMediaProvider.getFollowings(handleOrProfileId);
        case SocialPlatform.Farcaster:
            return FarcasterSocialMediaProvider.getFollowings(handleOrProfileId);
        case SocialPlatform.Twitter:
            return TwitterSocialMediaProvider.getFollowings(handleOrProfileId);
        default:
            safeUnreachable(source);
            return null;
    }
}
