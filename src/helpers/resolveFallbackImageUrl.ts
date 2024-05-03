import { createLookupTableResolver } from '@masknet/shared-base';

import { SocialPlatform } from '@/constants/enum.js';

export const resolveFallbackImageUrl = createLookupTableResolver(
    {
        [SocialPlatform.Farcaster]: '/image/farcaster-fallback.png',
        [SocialPlatform.Lens]: '/image/lens-fallback.png',
        [SocialPlatform.Twitter]: '/image/twitter-fallback.png',
        [SocialPlatform.Article]: ''
    },
    '',
);
