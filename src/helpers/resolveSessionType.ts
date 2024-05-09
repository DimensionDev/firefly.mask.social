import { createLookupTableResolver } from '@masknet/shared-base';

import { type SocialSource, Source } from '@/constants/enum.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export const resolveSessionType = createLookupTableResolver<SocialSource, SessionType>(
    {
        [Source.Farcaster]: SessionType.Farcaster,
        [Source.Lens]: SessionType.Lens,
        [Source.Twitter]: SessionType.Twitter,
    },
    (source) => {
        throw new Error(`Unknown source: ${source}`);
    },
);
