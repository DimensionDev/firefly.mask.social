import { safeUnreachable } from '@masknet/kit';

import { SocialPlatform } from '@/constants/enum.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';

export function getProfileById(source: SocialPlatform, handleOrProfileId: string) {
    switch (source) {
        case SocialPlatform.Lens:
            return LensSocialMediaProvider.getProfileByHandle(handleOrProfileId);
        case SocialPlatform.Farcaster:
            return FarcasterSocialMediaProvider.getProfileById(handleOrProfileId);
        default:
            safeUnreachable(source);
            return null;
    }
}
