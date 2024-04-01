import { createLookupTableResolver } from '@masknet/shared-base';

import { SocialPlatform, SourceInURL } from '@/constants/enum.js';

export const resolveSourceInURL = createLookupTableResolver<SocialPlatform, SourceInURL>(
    {
        [SocialPlatform.Farcaster]: SourceInURL.Farcaster,
        [SocialPlatform.Lens]: SourceInURL.Lens,
        [SocialPlatform.Twitter]: SourceInURL.Twitter,
    },
    (keyword) => {
        throw new Error(`Unknown keyword: ${keyword}`);
    },
);
