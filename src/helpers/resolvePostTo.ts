import { createLookupTableResolver } from '@masknet/shared-base';

import { Source, type SocialSource } from '@/constants/enum.js';
import { postToFarcaster } from '@/services/postToFarcaster.js';
import { postToLens } from '@/services/postToLens.js';
import { postToTwitter } from '@/services/postToTwitter.js';

export const resolvePostTo = createLookupTableResolver<SocialSource, typeof postToLens>(
    {
        [Source.Lens]: postToLens,
        [Source.Farcaster]: postToFarcaster,
        [Source.Twitter]: postToTwitter,
    },
    (source: Source) => {
        throw new Error(`Unknown social platform: ${source}`);
    },
);
