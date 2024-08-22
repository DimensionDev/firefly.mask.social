import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import { twitterSessionHolder } from '@/providers/twitter/SessionHolder.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import { walletSessionHolder } from '@/providers/wallet/SessionHolder.js';

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

export const resolveSessionHolderFromSessionType = createLookupTableResolver<SessionType, SessionHolder<Session>>(
    {
        [SessionType.Farcaster]: farcasterSessionHolder,
        [SessionType.Lens]: lensSessionHolder,
        [SessionType.Firefly]: fireflySessionHolder,
        [SessionType.Wallet]: walletSessionHolder,
        [SessionType.Twitter]: twitterSessionHolder,
    },
    (sessionType) => {
        throw new UnreachableError('sessionType', sessionType);
    },
);
