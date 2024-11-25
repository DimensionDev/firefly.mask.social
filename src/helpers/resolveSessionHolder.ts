import { type ProfileSource, type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import { thirdPartySessionHolder } from '@/providers/third-party/SessionHolder.js';
import { twitterSessionHolder } from '@/providers/twitter/SessionHolder.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export const resolveSessionHolder = createLookupTableResolver<SocialSource, SessionHolder<Session>>(
    {
        [Source.Farcaster]: farcasterSessionHolder,
        [Source.Lens]: lensSessionHolder,
        [Source.Twitter]: twitterSessionHolder,
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);

export const resolveSessionHolderFromProfileSource = createLookupTableResolver<ProfileSource, SessionHolder<Session>>(
    {
        [Source.Farcaster]: farcasterSessionHolder,
        [Source.Lens]: lensSessionHolder,
        [Source.Twitter]: twitterSessionHolder,
        [Source.Firefly]: fireflySessionHolder,
        [Source.Google]: thirdPartySessionHolder,
        [Source.Apple]: thirdPartySessionHolder,
        [Source.Telegram]: thirdPartySessionHolder,
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);

export const resolveSessionHolderFromSessionType = createLookupTableResolver<SessionType, SessionHolder<Session>>(
    {
        [SessionType.Farcaster]: farcasterSessionHolder,
        [SessionType.Lens]: lensSessionHolder,
        [SessionType.Firefly]: fireflySessionHolder,
        [SessionType.Twitter]: twitterSessionHolder,
        [SessionType.Apple]: thirdPartySessionHolder,
        [SessionType.Google]: thirdPartySessionHolder,
        [SessionType.Telegram]: thirdPartySessionHolder,
    },
    (sessionType) => {
        throw new UnreachableError('sessionType', sessionType);
    },
);
