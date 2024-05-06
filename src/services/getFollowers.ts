import { safeUnreachable } from '@masknet/kit';
import type { PageIndicator } from '@masknet/shared-base';

import { SocialPlatform } from '@/constants/enum.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';

export function getFollowers(source: SocialPlatform, handleOrProfileId: string, indicator?: PageIndicator) {
    switch (source) {
        case SocialPlatform.Lens:
            return LensSocialMediaProvider.getFollowers(handleOrProfileId, indicator);
        case SocialPlatform.Farcaster:
            return FarcasterSocialMediaProvider.getFollowers(handleOrProfileId, indicator);
        case SocialPlatform.Twitter:
            return TwitterSocialMediaProvider.getFollowings(handleOrProfileId);
        default:
            safeUnreachable(source);
            return null;
    }
}
