import { createLookupTableResolver } from '@masknet/shared-base';

import { SocialPlatform } from '@/constants/enum.js';

export type PlatformKeyword = 'lens' | 'farcaster';

export const resolvePlatform = createLookupTableResolver<PlatformKeyword, SocialPlatform>(
    {
        lens: SocialPlatform.Lens,
        farcaster: SocialPlatform.Farcaster,
    },
    (keyword) => {
        throw new Error(`Unknown keyword: ${keyword}`);
    },
);
