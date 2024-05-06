import { safeUnreachable } from '@masknet/kit';

import { Source } from '@/constants/enum.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';

export function resolveSocialMediaProvider(source: Source) {
    switch (source) {
        case Source.Lens:
            return LensSocialMediaProvider;
        case Source.Farcaster:
            return FarcasterSocialMediaProvider;
        case Source.Twitter:
            return TwitterSocialMediaProvider;
        case Source.Article:
            throw new Error('Not allowed');
        default:
            safeUnreachable(source);
            throw new Error(`Invalid source: ${source}`);
    }
}
