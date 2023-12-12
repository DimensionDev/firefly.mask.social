import { createLookupTableResolver } from '@masknet/shared-base';

import { SocialPlatform } from '@/constants/enum.js';

export const resolvePlatformName = createLookupTableResolver<SocialPlatform, string>(
    {
        [SocialPlatform.Lens]: 'Lens Protocol',
        [SocialPlatform.Farcaster]: 'Farcaster',
    },
    (platform) => {
        throw new Error(`Unknown social platform: ${platform}`);
    },
);
