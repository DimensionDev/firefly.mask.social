import { createLookupTableResolver } from '@masknet/shared-base';

import { Source } from '@/constants/enum.js';

export const resolveFallbackImageUrl = createLookupTableResolver(
    {
        [Source.Farcaster]: '/image/farcaster-fallback.png',
        [Source.Lens]: '/image/lens-fallback.png',
        [Source.Twitter]: '/image/twitter-fallback.png',
        [Source.Article]: '',
    },
    '',
);
