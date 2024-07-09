import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export const resolveSessionType = createLookupTableResolver<SocialSource, SessionType>(
    {
        [Source.Farcaster]: SessionType.Farcaster,
        [Source.Lens]: SessionType.Lens,
        [Source.Twitter]: SessionType.Twitter,
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);
