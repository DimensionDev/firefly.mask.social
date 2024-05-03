import { createLookupTableResolver } from '@masknet/shared-base';

import { SocialPlatform, SourceInURL } from '@/constants/enum.js';

export const resolveSocialPlatform = createLookupTableResolver<SourceInURL, SocialPlatform>(
    {
        [SourceInURL.Farcaster]: SocialPlatform.Farcaster,
        [SourceInURL.Lens]: SocialPlatform.Lens,
        [SourceInURL.Twitter]: SocialPlatform.Twitter,
        [SourceInURL.Article]: SocialPlatform.Article,
    },
    (keyword) => {
        throw new Error(`Unknown keyword: ${keyword}`);
    },
);
