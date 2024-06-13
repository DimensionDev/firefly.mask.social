import { createLookupTableResolver } from '@masknet/shared-base';

import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { postToFarcaster } from '@/services/postToFarcaster.js';
import { postToLens } from '@/services/postToLens.js';
import { postToTwitter } from '@/services/postToTwitter.js';

export const resolvePostTo = createLookupTableResolver<SocialSource, typeof postToLens>(
    {
        [Source.Lens]: postToLens,
        [Source.Farcaster]: postToFarcaster,
        [Source.Twitter]: postToTwitter,
    },
    (source: SocialSource) => {
        throw new UnreachableError('source', source);
    },
);
