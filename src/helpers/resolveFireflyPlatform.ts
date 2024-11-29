import { FireflyPlatform, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';

export const resolveFireflyPlatform = createLookupTableResolver<Source, FireflyPlatform | null>(
    {
        [Source.Farcaster]: FireflyPlatform.Farcaster,
        [Source.Lens]: FireflyPlatform.Lens,
        [Source.Twitter]: FireflyPlatform.Twitter,
        [Source.Firefly]: FireflyPlatform.Firefly,
        [Source.Article]: FireflyPlatform.Article,
        [Source.Wallet]: FireflyPlatform.Wallet,
        [Source.NFTs]: FireflyPlatform.NFTs,
        [Source.DAOs]: FireflyPlatform.DAOs,
        [Source.Polymarket]: FireflyPlatform.Polymarket,
        [Source.Telegram]: null,
        [Source.Google]: null,
        [Source.Apple]: null,
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);
