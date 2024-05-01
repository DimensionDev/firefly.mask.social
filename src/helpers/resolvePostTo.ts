import { createLookupTableResolver } from '@masknet/shared-base';

import { SocialPlatform } from '@/constants/enum.js';
import { postToFarcaster } from '@/services/postToFarcaster.js';
import { postToLens } from '@/services/postToLens.js';
import { postToTwitter } from '@/services/postToTwitter.js';

export const resolvePostTo = createLookupTableResolver<SocialPlatform, typeof postToLens>(
    {
        [SocialPlatform.Lens]: postToLens,
        [SocialPlatform.Farcaster]: postToFarcaster,
        [SocialPlatform.Twitter]: postToTwitter,
    },
    (source: SocialPlatform) => {
        throw new Error(`Unknown social platform: ${source}`);
    },
);
