import { createLookupTableResolver } from '@masknet/shared-base';

import { SocialPlatform, SourceInURL } from '@/constants/enum.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export const resolveSocialPlatform = createLookupTableResolver<SourceInURL, SocialPlatform>(
    {
        [SourceInURL.Farcaster]: SocialPlatform.Farcaster,
        [SourceInURL.Lens]: SocialPlatform.Lens,
        [SourceInURL.Twitter]: SocialPlatform.Twitter,
    },
    (keyword) => {
        throw new Error(`Unknown keyword: ${keyword}`);
    },
);

export const resolveSocialPlatformFromSessionType = createLookupTableResolver<SessionType, SocialPlatform>(
    {
        [SessionType.Farcaster]: SocialPlatform.Farcaster,
        [SessionType.Lens]: SocialPlatform.Lens,
        [SessionType.Twitter]: SocialPlatform.Twitter,
        // not correct in some situations
        [SessionType.Firefly]: SocialPlatform.Farcaster,
    },
    (keyword) => {
        throw new Error(`Unknown keyword: ${keyword}`);
    },
);
