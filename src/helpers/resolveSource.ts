import { createLookupTableResolver } from '@masknet/shared-base';

import { SocialPlatform } from '@/constants/enum.js';

export type SourceKeyword = 'lens' | 'farcaster';

export const resolveSource = createLookupTableResolver<SourceKeyword, SocialPlatform>(
    {
        lens: SocialPlatform.Lens,
        farcaster: SocialPlatform.Farcaster,
    },
    (keyword) => {
        throw new Error(`Unknown keyword: ${keyword}`);
    },
);
