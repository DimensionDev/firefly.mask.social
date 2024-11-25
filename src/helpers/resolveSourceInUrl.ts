import {
    type ExploreSource,
    type ExploreSourceInURL,
    type SocialSource,
    type SocialSourceInURL,
    Source,
    SourceInURL,
    TrendingType,
} from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';

export const resolveSourceInUrl = createLookupTableResolver<Source, SourceInURL>(
    {
        [Source.Farcaster]: SourceInURL.Farcaster,
        [Source.Lens]: SourceInURL.Lens,
        [Source.Twitter]: SourceInURL.Twitter,
        [Source.Firefly]: SourceInURL.Firefly,
        [Source.Article]: SourceInURL.Article,
        [Source.Wallet]: SourceInURL.Wallet,
        [Source.NFTs]: SourceInURL.NFTs,
        [Source.Snapshot]: SourceInURL.Snapshot,
        [Source.Polymarket]: SourceInURL.Polymarket,
        [Source.Telegram]: SourceInURL.Telegram,
        [Source.Google]: SourceInURL.Google,
        [Source.Apple]: SourceInURL.Apple,
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);

export const resolveSocialSourceInUrl = createLookupTableResolver<SocialSource, SocialSourceInURL>(
    {
        [Source.Farcaster]: SourceInURL.Farcaster,
        [Source.Lens]: SourceInURL.Lens,
        [Source.Twitter]: SourceInURL.Twitter,
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);

export const resolveExploreSourceInURL = createLookupTableResolver<ExploreSource, ExploreSourceInURL>(
    {
        [Source.Farcaster]: SourceInURL.Farcaster,
        [Source.Lens]: SourceInURL.Lens,
        [TrendingType.TopGainers]: TrendingType.TopGainers,
        [TrendingType.TopLosers]: TrendingType.TopLosers,
        [TrendingType.Trending]: TrendingType.Trending,
        [TrendingType.Meme]: TrendingType.Meme,
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);

export const resolveExploreSource = createLookupTableResolver<ExploreSourceInURL, ExploreSource>(
    {
        [SourceInURL.Farcaster]: Source.Farcaster,
        [SourceInURL.Lens]: Source.Lens,
        [TrendingType.TopGainers]: TrendingType.TopGainers,
        [TrendingType.TopLosers]: TrendingType.TopLosers,
        [TrendingType.Trending]: TrendingType.Trending,
        [TrendingType.Meme]: TrendingType.Meme,
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);
