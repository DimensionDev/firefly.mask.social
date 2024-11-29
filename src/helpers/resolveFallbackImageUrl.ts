import { type LoginFallbackSource, Source } from '@/constants/enum.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';

export const resolveFallbackImageUrl = createLookupTableResolver<LoginFallbackSource, string>(
    {
        [Source.Farcaster]: '/image/farcaster-fallback.png',
        [Source.Lens]: '/image/lens-fallback.png',
        [Source.Twitter]: '/image/x-fallback.png',
        [Source.Article]: '/image/article-fallback.png',
        [Source.DAOs]: '/image/article-fallback.png',
        [Source.Polymarket]: '/image/article-fallback.png',
    },
    '',
);
