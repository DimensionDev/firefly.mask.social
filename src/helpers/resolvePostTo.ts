import { createLookupTableResolver } from '@masknet/shared-base';

import { Source } from '@/constants/enum.js';
import { postToFarcaster } from '@/services/postToFarcaster.js';
import { postToLens } from '@/services/postToLens.js';
import { postToTwitter } from '@/services/postToTwitter.js';

export const resolvePostTo = createLookupTableResolver<Source, typeof postToLens | undefined>(
    {
        [Source.Lens]: postToLens,
        [Source.Farcaster]: postToFarcaster,
        [Source.Twitter]: postToTwitter,
        [Source.Article]: undefined,
    },
    (source: Source) => {
        throw new Error(`Unknown social platform: ${source}`);
    },
);
