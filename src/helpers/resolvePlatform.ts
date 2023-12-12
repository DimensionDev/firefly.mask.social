import { SocialPlatform } from '@/constants/enum.js';
import { createLookupTableResolver } from '@/maskbook/packages/shared-base/src/index.js';

export const resolvePlatform = createLookupTableResolver(
    {
        lens: SocialPlatform.Lens,
        farcaster: SocialPlatform.Farcaster,
    },
    (keyword) => {
        throw new Error(`Unknown keyword: ${keyword}`);
    },
);
