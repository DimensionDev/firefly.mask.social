import { createLookupTableResolver } from '@masknet/shared-base';

import { SocialPlatform } from '@/constants/enum.js';

export const resolveSourceName = createLookupTableResolver<SocialPlatform, string>(
    {
        [SocialPlatform.Lens]: 'Lens',
        [SocialPlatform.Farcaster]: 'Farcaster',
    },
    (source) => {
        throw new Error(`Unknown social platform: ${source}`);
    },
);
