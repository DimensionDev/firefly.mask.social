import { createLookupTableResolver } from '@masknet/shared-base';

import { type SocialSource, Source } from '@/constants/enum.js';

export const resolveFallbackImageUrl = createLookupTableResolver<SocialSource | Source.Article, string>(
    {
        [Source.Farcaster]: '/image/farcaster-fallback.png',
        [Source.Lens]: '/image/lens-fallback.png',
        [Source.Twitter]: '/image/twitter-fallback.png',
        [Source.Article]: '/image/article-fallback.png',
    },
    '',
);
