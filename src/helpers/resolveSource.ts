import { createLookupTableResolver } from '@masknet/shared-base';

import { Source, SourceInURL } from '@/constants/enum.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export const resolveSource = createLookupTableResolver<SourceInURL, Source>(
    {
        [SourceInURL.Farcaster]: Source.Farcaster,
        [SourceInURL.Lens]: Source.Lens,
        [SourceInURL.Twitter]: Source.Twitter,
        [SourceInURL.Article]: Source.Article,
    },
    (keyword) => {
        throw new Error(`Unknown keyword: ${keyword}`);
    },
);

export const resolveSourceFromSessionType = createLookupTableResolver<SessionType, Source>(
    {
        [SessionType.Farcaster]: Source.Farcaster,
        [SessionType.Lens]: Source.Lens,
        [SessionType.Twitter]: Source.Twitter,
        // not correct in some situations
        [SessionType.Firefly]: Source.Farcaster,
    },
    (keyword) => {
        throw new Error(`Unknown keyword: ${keyword}`);
    },
);
