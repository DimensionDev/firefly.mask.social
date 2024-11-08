import { type SocialSource, type SocialSourceInURL, Source, SourceInURL } from '@/constants/enum.js';
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
