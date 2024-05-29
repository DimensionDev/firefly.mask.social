import { createLookupTableResolver } from '@masknet/shared-base';

import { type SocialSource, Source } from '@/constants/enum.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import { twitterSessionHolder } from '@/providers/twitter/SessionHolder.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export const resolveSessionHolder = createLookupTableResolver<SocialSource, SessionHolder<Session> | null>(
    {
        [Source.Farcaster]: farcasterSessionHolder,
        [Source.Lens]: lensSessionHolder,
        [Source.Twitter]: twitterSessionHolder,
    },
    () => null,
);

export const resolveSessionHolderFromSessionType = createLookupTableResolver<
    SessionType,
    SessionHolder<Session> | null
>(
    {
        [SessionType.Farcaster]: farcasterSessionHolder,
        [SessionType.Lens]: lensSessionHolder,
        [SessionType.Firefly]: fireflySessionHolder,
        [SessionType.Twitter]: twitterSessionHolder,
    },
    () => null,
);
