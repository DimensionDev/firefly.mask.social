import { createLookupTableResolver } from '@masknet/shared-base';

import { type SocialSource, type SocialSourceInURL, Source, SourceInURL } from '@/constants/enum.js';

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
    },
    (keyword) => {
        throw new Error(`Unknown keyword: ${keyword}`);
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
    },
    (keyword) => {
        throw new Error(`Unknown keyword: ${keyword}`);
    },
);
