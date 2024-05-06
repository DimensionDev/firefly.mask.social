import { safeUnreachable } from '@masknet/kit';

import { Source } from '@/constants/enum.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';

export function getProfileById(source: Source, handleOrProfileId: string) {
    switch (source) {
        case Source.Lens:
            return LensSocialMediaProvider.getProfileByHandle(handleOrProfileId);
        case Source.Farcaster:
            return FarcasterSocialMediaProvider.getProfileById(handleOrProfileId);
        case Source.Twitter:
            return TwitterSocialMediaProvider.getProfileById(handleOrProfileId);
        case Source.Article:
            return null;
        default:
            safeUnreachable(source);
            return null;
    }
}
