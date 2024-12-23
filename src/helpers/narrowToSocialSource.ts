import { type SocialSource, type SocialSourceInURL, Source, SourceInURL } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';

export const narrowToSocialSource = createLookupTableResolver<Source, SocialSource>(
    {
        [Source.Farcaster]: Source.Farcaster,
        [Source.Lens]: Source.Lens,
        [Source.Twitter]: Source.Twitter,
        [Source.Firefly]: Source.Farcaster,
        [Source.Wallet]: Source.Farcaster,
        // default to Farcaster
        [Source.Article]: Source.Farcaster,
        [Source.NFTs]: Source.Farcaster,
        [Source.DAOs]: Source.Farcaster,
        [Source.Polymarket]: Source.Farcaster,
        [Source.Telegram]: Source.Farcaster,
        [Source.Google]: Source.Farcaster,
        [Source.Apple]: Source.Farcaster,
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);

export const narrowToSocialSourceInURL = createLookupTableResolver<SourceInURL, SocialSourceInURL>(
    {
        [SourceInURL.Farcaster]: SourceInURL.Farcaster,
        [SourceInURL.Lens]: SourceInURL.Lens,
        [SourceInURL.Twitter]: SourceInURL.Twitter,
        [SourceInURL.Firefly]: SourceInURL.Farcaster,
        [SourceInURL.Wallet]: SourceInURL.Farcaster,
        // default to Farcaster
        [SourceInURL.Article]: SourceInURL.Farcaster,
        [SourceInURL.NFTs]: SourceInURL.Farcaster,
        [SourceInURL.DAOs]: SourceInURL.Farcaster,
        [SourceInURL.Polymarket]: SourceInURL.Farcaster,
        [SourceInURL.Telegram]: SourceInURL.Farcaster,
        [SourceInURL.Google]: SourceInURL.Farcaster,
        [SourceInURL.Apple]: SourceInURL.Farcaster,
    },
    (sourceInUrl) => {
        throw new UnreachableError('sourceInUrl', sourceInUrl);
    },
);
