import { type ProfileSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export const resolveSessionTypeToSource = createLookupTableResolver<SessionType, ProfileSource>(
    {
        [SessionType.Apple]: Source.Apple,
        [SessionType.Google]: Source.Google,
        [SessionType.Telegram]: Source.Telegram,
        [SessionType.Farcaster]: Source.Farcaster,
        [SessionType.Lens]: Source.Lens,
        [SessionType.Twitter]: Source.Twitter,
        [SessionType.Firefly]: Source.Firefly,
    },
    (type) => {
        throw new UnreachableError('session', type);
    },
);
