import { type SocialSource, Source } from '@/constants/enum.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';

export const resolveFallbackImageUrl = createLookupTableResolver<
    SocialSource | Source.Article | Source.Snapshot,
    string
>(
    {
        [Source.Farcaster]: '/image/farcaster-fallback.png',
        [Source.Lens]: '/image/lens-fallback.png',
        [Source.Twitter]: '/image/x-fallback.png',
        [Source.Article]: '/image/article-fallback.png',
        [Source.Snapshot]: '/image/article-fallback.png',
    },
    '',
);
